import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { CONTACT } from "@/lib/courses";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex flex-col leading-none not-italic" aria-label="Victor Promise home">
      <span className="font-logo text-xl tracking-wide text-secondary">VICTOR</span>
      <span className="font-script -mt-1 pl-6 text-lg text-accent">Promise</span>
    </Link>
  );
}

const NAV = [
  { to: "/", label: "Home", hash: "" },
  { to: "/courses", label: "Courses", hash: "" },
  { to: "/", label: "FAQ", hash: "faq" },
  { to: "/", label: "Contact", hash: "contact" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { session, isAdmin } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/" });
  }
  const accountLinks = session ? (
    <>
      <Link to="/dashboard" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-secondary">Dashboard</Link>
      {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="text-accent hover:underline">Admin</Link>}
      <button onClick={signOut} className="text-left text-muted-foreground hover:text-secondary">Sign out</button>
    </>
  ) : (
    <Link to="/auth" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-secondary">Sign in</Link>
  );
  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm md:flex">
            {NAV.map((n) => (
              <Link key={n.label} to={n.to} {...(n.hash ? { hash: n.hash } : {})} className="text-muted-foreground transition-colors hover:text-secondary">
                {n.label}
              </Link>
            ))}
            {accountLinks}
            <Link to="/courses" className="border border-secondary bg-primary px-4 py-2 font-semibold not-italic text-primary-foreground hover:bg-secondary">
              Enroll now
            </Link>
          </nav>
          <button className="grid h-11 w-11 shrink-0 place-items-center md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col border-t border-border px-5 py-2 md:hidden">
            {NAV.map((n) => (
              <Link key={n.label} to={n.to} {...(n.hash ? { hash: n.hash } : {})} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-border text-sm font-medium">
                {n.label}
              </Link>
            ))}
            <div className="flex min-h-12 flex-col justify-center gap-3 py-3">{accountLinks}</div>
            <Link to="/courses" onClick={() => setOpen(false)} className="mb-3 flex min-h-12 items-center justify-center bg-primary px-4 font-semibold text-primary-foreground">Enroll now</Link>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="mt-24 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
          <Logo />
          <p className="text-sm text-muted-foreground">Practical AI skills for everyday life, business and income.</p>
          <div className="flex gap-4 text-sm">
            <a href={CONTACT.whatsappUrl} target="_blank" rel="noreferrer" className="text-secondary hover:underline">WhatsApp</a>
            <a href={CONTACT.telegramUrl} target="_blank" rel="noreferrer" className="text-secondary hover:underline">Telegram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function ContactButtons() {
  return (
    <div className="grid gap-3 sm:flex sm:flex-wrap">
      <a href={CONTACT.whatsappUrl} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center border border-primary bg-primary px-5 py-3 text-center font-semibold not-italic text-primary-foreground hover:bg-secondary">
        WhatsApp {CONTACT.whatsappDisplay}
      </a>
      <a href={CONTACT.telegramUrl} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center border border-primary px-5 py-3 text-center font-semibold not-italic text-primary hover:bg-muted">
        Telegram @victorpromisee
      </a>
    </div>
  );
}
