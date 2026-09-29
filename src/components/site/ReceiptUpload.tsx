import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ContactButtons } from "./SiteLayout";
import type { Course } from "@/lib/courses";

const ALLOWED = ["image/jpeg", "image/png", "application/pdf"];

export function ReceiptUpload({ course }: { course: Course }) {
  const { session, profile, loading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!session) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Sign in to upload your payment receipt.</p>
        <Link to="/auth" search={{ redirect: `/courses/${course.slug}` }} className="self-start border border-secondary bg-primary px-5 py-3 font-semibold not-italic text-primary-foreground hover:bg-secondary">
          Sign in to submit receipt
        </Link>
      </div>
    );
  }

  if (profile?.account_status === "banned") {
    return <p className="text-sm text-destructive">Your account has been suspended. Please contact VICTOR PROMISE.</p>;
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-semibold text-secondary">Receipt submitted. Status: Pending Payment Verification.</p>
        <p className="text-sm text-muted-foreground">Your payment is not confirmed yet. Message VICTOR PROMISE so it can be checked and approved.</p>
        <ContactButtons />
        <div className="flex flex-wrap gap-3">
          <Link to="/" className="border border-border px-5 py-3 hover:border-secondary">Back to Home</Link>
          <Link to="/courses" className="border border-border px-5 py-3 hover:border-secondary">Explore More Courses</Link>
          <Link to="/dashboard" className="border border-border px-5 py-3 hover:border-secondary">My dashboard</Link>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !session) return toast.error("Choose your receipt file first.");
    if (!ALLOWED.includes(file.type)) return toast.error("Upload a JPG, PNG or PDF.");
    if (file.size > 10 * 1024 * 1024) return toast.error("File must be under 10MB.");
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${session.user.id}/${course.slug}-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("receipts").upload(path, file, { contentType: file.type });
    if (up.error) { setBusy(false); return toast.error("Upload failed. Please try again."); }
    const { error } = await supabase.from("payment_submissions").insert({
      user_id: session.user.id,
      course_slug: course.slug,
      course_title: course.title,
      amount: course.price,
      receipt_path: path,
    });
    setBusy(false);
    if (error) return toast.error("Could not save your submission. Please try again.");
    setDone(true);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="text-sm text-muted-foreground">Upload your receipt (JPG, PNG or PDF)</label>
      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="border border-input bg-background p-3 text-sm file:mr-3 file:border-0 file:bg-muted file:px-3 file:py-1 file:text-foreground" />
      <button disabled={busy} className="self-start border border-secondary bg-primary px-5 py-3 font-semibold not-italic text-primary-foreground hover:bg-secondary disabled:opacity-60">
        {busy ? "Uploading…" : "Submit receipt"}
      </button>
    </form>
  );
}
