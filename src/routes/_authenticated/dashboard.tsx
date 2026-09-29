import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, ContactButtons } from "@/components/site/SiteLayout";
import { useAuth } from "@/hooks/use-auth";
import { formatNaira } from "@/lib/courses";
import { STATUS_CLASS, STATUS_LABEL } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — VICTOR PROMISE" }, { name: "description", content: "Your courses and payment status." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { session, profile } = useAuth();
  const { data: subs = [], isLoading } = useQuery({
    queryKey: ["my-submissions", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_submissions").select("*").eq("user_id", session!.user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-5 py-14">
        <p className="text-sm text-primary">// student dashboard</p>
        <h1 className="mt-2 text-4xl">Hello{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
        <p className="mt-1 text-muted-foreground">{profile?.email ?? session?.user.email}</p>

        {profile?.account_status === "banned" && (
          <div className="mt-6 border border-destructive p-4 text-destructive">Your account has been suspended. Contact VICTOR PROMISE for help.</div>
        )}

        <div className="mt-10 flex items-end justify-between border-b border-border pb-3">
          <h2 className="text-2xl">My courses & payments</h2>
          <Link to="/courses" className="text-sm text-secondary hover:underline">Browse courses →</Link>
        </div>

        {isLoading ? (
          <p className="py-8 text-muted-foreground">Loading…</p>
        ) : subs.length === 0 ? (
          <div className="py-10">
            <p className="text-muted-foreground">You haven't submitted any payments yet.</p>
            <Link to="/courses" className="mt-4 inline-block border border-secondary bg-primary px-5 py-3 font-semibold not-italic text-primary-foreground">Choose a course</Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {subs.map((s) => (
              <li key={s.id} className="flex flex-col gap-2 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-display text-lg not-italic">{s.course_title}</p>
                  <p className="text-sm text-muted-foreground">{formatNaira(s.amount)} · submitted {new Date(s.created_at).toLocaleDateString()}</p>
                  {s.status === "rejected" && <p className="mt-1 text-sm text-destructive">{s.admin_note || "Please contact support about this payment."}</p>}
                </div>
                <span className={`self-start border px-3 py-1 text-xs md:self-center ${STATUS_CLASS[s.status]}`}>{STATUS_LABEL[s.status]}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 border border-border bg-card p-6">
          <h2 className="text-xl">Need help with a payment?</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">Payments are checked manually. Reach out to speed things up.</p>
          <ContactButtons />
        </div>
      </section>
    </SiteLayout>
  );
}
