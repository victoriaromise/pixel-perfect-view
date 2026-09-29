import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMINS = ["vpromise06@gmail.com", "vicolabisi2020@gmail.com", "aispecialist47@gmail.com"];
const GATEWAY = "https://connector-gateway.lovable.dev/resend";

async function send(to: string[], subject: string, text: string) {
  const lk = process.env['LOVABLE_API_KEY'];
  const rk = process.env['RESEND_API_KEY'];
  if (!lk || !rk) throw new Error("Email is not configured");
  const from = process.env['EMAIL_FROM'] || "VICTOR PROMISE <onboarding@resend.dev>";
  const res = await fetch(`${GATEWAY}/emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": rk },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) console.error(`Resend failed [${res.status}]: ${await res.text()}`);
  return res.ok;
}

export const notifyPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), event: z.enum(["submitted", "reviewed"]) }).parse(d))
  .handler(async ({ data, context }) => {
    // RLS: owners see their own rows, admins see all.
    const { data: sub } = await context.supabase.from("payment_submissions").select("*").eq("id", data.id).maybeSingle();
    if (!sub) return { ok: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(sub.user_id);
    const email = u.user?.email;
    const amount = `₦${sub.amount.toLocaleString()}`;

    if (data.event === "submitted") {
      if (sub.user_id !== context.userId) return { ok: false };
      if (email) await send([email], "We received your payment receipt",
        `Thanks! Your receipt for ${sub.course_title} (${amount}) was received and is waiting for review. We'll email you once it's checked.\n\n— VICTOR PROMISE`);
      await send(ADMINS, `New receipt: ${sub.course_title}`,
        `${email ?? "A student"} submitted a receipt for ${sub.course_title} (${amount}). Review it in the admin dashboard.`);
    } else {
      if (sub.status === "pending" || !email) return { ok: true };
      const approved = sub.status === "approved";
      await send([email], approved ? "Your payment was approved 🎉" : "Update on your payment",
        approved
          ? `Your payment for ${sub.course_title} has been approved. Welcome to the course! Check your dashboard for next steps.\n\n— VICTOR PROMISE`
          : `Your payment for ${sub.course_title} could not be confirmed.${sub.admin_note ? `\nReason: ${sub.admin_note}` : ""}\nPlease contact us on WhatsApp (09012125850) if you need help.\n\n— VICTOR PROMISE`);
    }
    return { ok: true };
  });
