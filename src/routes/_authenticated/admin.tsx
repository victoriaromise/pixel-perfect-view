import { createFileRoute, Link } from "@tanstack/react-router";
import { notifyPayment } from "@/lib/notify.functions";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/hooks/use-auth";
import { COURSES, formatNaira } from "@/lib/courses";
import { STATUS_CLASS, STATUS_LABEL, type PaymentStatus } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — VICTOR PROMISE" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <SiteLayout><p className="p-10 text-muted-foreground">Loading…</p></SiteLayout>;
  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="text-3xl">Access denied</h1>
          <p className="mt-2 text-muted-foreground">This area is for VICTOR PROMISE administrators only.</p>
          <Link to="/dashboard" className="mt-6 inline-block text-secondary underline">Go to my dashboard</Link>
        </div>
      </SiteLayout>
    );
  }
  return <AdminPanel />;
}

function AdminPanel() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview" | "payments" | "users">("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");

  const { data } = useQuery({
    queryKey: ["admin-data"],
    queryFn: async () => {
      const [p, s, r] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("payment_submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
      ]);
      if (p.error) throw p.error;
      if (s.error) throw s.error;
      return { profiles: p.data, subs: s.data, admins: new Set((r.data ?? []).map((x) => x.user_id)) };
    },
  });
  const profiles = data?.profiles ?? [];
  const subs = data?.subs ?? [];
  const byId = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const stats = useMemo(() => {
    const approved = subs.filter((s) => s.status === "approved");
    return {
      users: profiles.length,
      active: profiles.filter((p) => p.account_status === "active").length,
      banned: profiles.filter((p) => p.account_status === "banned").length,
      registrations: subs.length,
      pending: subs.filter((s) => s.status === "pending").length,
      approved: approved.length,
      rejected: subs.filter((s) => s.status === "rejected").length,
      submitted: subs.reduce((a, s) => a + s.amount, 0),
      revenue: approved.reduce((a, s) => a + s.amount, 0),
      byCourse: COURSES.map((c) => ({ title: c.title, total: approved.filter((s) => s.course_slug === c.slug).reduce((a, s) => a + s.amount, 0), count: approved.filter((s) => s.course_slug === c.slug).length })),
    };
  }, [profiles, subs]);

  async function viewReceipt(path: string) {
    const { data, error } = await supabase.storage.from("receipts").createSignedUrl(path, 300);
    if (error || !data) { toast.error("Could not open receipt."); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }
  async function review(id: string, status: PaymentStatus) {
    const note = status === "rejected" ? window.prompt("Reason shown to the student (optional):") ?? "" : null;
    const { error } = await supabase.rpc("review_payment", { _id: id, _status: status, _note: note ?? "" });
    if (error) { toast.error(error.message); return; }
    notifyPayment({ data: { id, event: "reviewed" } }).catch(() => {});
    toast.success(status === "approved" ? "Payment approved" : status === "rejected" ? "Payment rejected" : "Marked pending");
    qc.invalidateQueries({ queryKey: ["admin-data"] });
  }
  async function setBan(userId: string, banned: boolean) {
    if (banned && !window.confirm("Ban this user? They will lose access.")) return;
    const { error } = await supabase.rpc("set_account_status", { _user_id: userId, _status: banned ? "banned" : "active" });
    if (error) { toast.error(error.message); return; }
    toast.success(banned ? "User banned" : "User restored");
    qc.invalidateQueries({ queryKey: ["admin-data"] });
  }

  const q = search.toLowerCase();
  const filteredSubs = subs.filter((s) => {
    const p = byId.get(s.user_id);
    return (statusFilter === "all" || s.status === statusFilter) && (!q || `${p?.full_name} ${p?.email} ${s.course_title}`.toLowerCase().includes(q));
  });
  const filteredUsers = profiles.filter((p) => !q || `${p.full_name} ${p.email}`.toLowerCase().includes(q));

  const Stat = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-background p-5"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold not-italic">{value}</p></div>
  );

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-sm text-primary">// admin</p>
        <h1 className="mt-1 text-4xl">Control room</h1>
        <div className="mt-8 flex gap-1 border-b border-border">
          {(["overview", "payments", "users"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm capitalize ${tab === t ? "border-b-2 border-secondary text-secondary" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>

        {tab === "overview" && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-5">
              <Stat label="Registered users" value={stats.users} />
              <Stat label="Active users" value={stats.active} />
              <Stat label="Banned users" value={stats.banned} />
              <Stat label="Course registrations" value={stats.registrations} />
              <Stat label="Pending payments" value={stats.pending} />
              <Stat label="Approved payments" value={stats.approved} />
              <Stat label="Rejected payments" value={stats.rejected} />
              <Stat label="Total submitted" value={formatNaira(stats.submitted)} />
              <Stat label="Approved revenue" value={formatNaira(stats.revenue)} />
            </div>
            <h2 className="mt-10 text-2xl">Revenue by course</h2>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {stats.byCourse.map((c) => (
                <li key={c.title} className="flex justify-between py-3 text-sm"><span>{c.title}</span><span className="text-accent">{formatNaira(c.total)} · {c.count}</span></li>
              ))}
            </ul>
          </>
        )}

        {tab !== "overview" && (
          <div className="mt-6 flex flex-wrap gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, course…" className="min-w-64 flex-1 border border-input bg-background px-4 py-2 not-italic outline-none focus:border-secondary" />
            {tab === "payments" && (
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="border border-input bg-background px-3 py-2">
                <option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
              </select>
            )}
          </div>
        )}

        {tab === "payments" && (
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {filteredSubs.length === 0 && <li className="py-6 text-muted-foreground">No submissions.</li>}
            {filteredSubs.map((s) => {
              const p = byId.get(s.user_id);
              return (
                <li key={s.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="not-italic font-semibold">{p?.full_name || "—"} <span className="font-normal text-muted-foreground">· {p?.email}</span></p>
                    <p className="text-sm text-muted-foreground">{s.course_title} · {formatNaira(s.amount)} · {new Date(s.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`border px-2 py-1 text-xs ${STATUS_CLASS[s.status]}`}>{STATUS_LABEL[s.status]}</span>
                    <button onClick={() => viewReceipt(s.receipt_path)} className="border border-border px-3 py-1 text-sm hover:border-secondary">Receipt</button>
                    {s.status !== "approved" && <button onClick={() => review(s.id, "approved")} className="border border-secondary bg-primary px-3 py-1 text-sm text-primary-foreground">Approve</button>}
                    {s.status !== "rejected" && <button onClick={() => review(s.id, "rejected")} className="border border-destructive px-3 py-1 text-sm text-destructive">Reject</button>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {tab === "users" && (
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {filteredUsers.map((p) => {
              const mine = subs.filter((s) => s.user_id === p.id);
              const isAdminUser = data?.admins.has(p.id);
              return (
                <li key={p.id} className="flex flex-col gap-2 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="not-italic font-semibold">{p.full_name || "—"} {isAdminUser && <span className="ml-2 text-xs text-accent">ADMIN</span>}</p>
                    <p className="text-sm text-muted-foreground">{p.email} · joined {new Date(p.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">{mine.length ? mine.map((s) => `${s.course_title} (${s.status})`).join(", ") : "No courses"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`border px-2 py-1 text-xs ${p.account_status === "banned" ? "border-destructive text-destructive" : "border-secondary text-secondary"}`}>{p.account_status}</span>
                    {!isAdminUser && (p.account_status === "active"
                      ? <button onClick={() => setBan(p.id, true)} className="border border-destructive px-3 py-1 text-sm text-destructive">Ban</button>
                      : <button onClick={() => setBan(p.id, false)} className="border border-secondary px-3 py-1 text-sm text-secondary">Unban</button>)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </SiteLayout>
  );
}
