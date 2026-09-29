import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/hooks/use-auth";

const safePath = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/dashboard");

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — VICTOR PROMISE" },
      { name: "description", content: "Sign in or create your VICTOR PROMISE account to enroll in AI courses." },
      { property: "og:title", content: "Sign in — VICTOR PROMISE" },
      { property: "og:description", content: "Access your VICTOR PROMISE student dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const inputCls = "w-full border border-input bg-background px-4 py-3 not-italic outline-none focus:border-secondary";

function AuthPage() {
  const { redirect } = Route.useSearch();
  const target = safePath(redirect);
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (!loading && session) {
      sessionStorage.removeItem("vp_redirect");
      navigate({ to: target });
    }
  }, [session, loading, target, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const schema = z.object({
      name: mode === "signup" ? z.string().trim().min(2, "Enter your full name").max(80) : z.string(),
      email: z.string().trim().email("Enter a valid email").max(255),
      password: z.string().min(8, "Password must be at least 8 characters").max(72),
    });
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0]!.message); return; }
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { data: { full_name: parsed.data.name }, emailRedirectTo: `${window.location.origin}/auth?redirect=${encodeURIComponent(target)}` },
      });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      if (!data.session) toast.success("Check your email to confirm your account, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
    }
  }

  async function google() {
    sessionStorage.setItem("vp_redirect", target);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth?redirect=${encodeURIComponent(target)}` });
    if (result.error) toast.error("Google sign-in failed. Please try again.");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-5 py-16">
        <h1 className="text-4xl">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin" ? "Sign in to submit receipts and view your courses." : "Join VICTOR PROMISE and start learning practical AI."}
        </p>
        <button onClick={google} className="mt-8 w-full border border-border bg-card px-4 py-3 not-italic hover:border-secondary">
          Continue with Google
        </button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input className={inputCls} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          )}
          <input className={inputCls} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className={inputCls} type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button disabled={busy} className="mt-2 border border-secondary bg-primary px-4 py-3 font-semibold not-italic text-primary-foreground hover:bg-secondary disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          {mode === "signin" ? "New here? " : "Already have an account? "}
          <button className="text-secondary underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <Link to="/" className="mt-8 inline-block text-sm text-muted-foreground hover:text-secondary">← Back home</Link>
      </section>
    </SiteLayout>
  );
}
