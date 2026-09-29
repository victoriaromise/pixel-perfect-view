import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { CONTACT } from "@/lib/courses";

export function Logo() {
  return (
    <Link to="/" className="flex flex-col leading-none not-italic" aria-label="Victor Promise home">
      <span className="font-logo text-xl tracking-wide text-secondary">VICTOR</span>
      <span className="font-script -mt-1 pl-6 text-lg text-accent">Promise</span>
    </Link>
  );
}

const NAV = [
  { to: "/", label: "Home", hash: undefined },
  { to: "/courses", label: "Courses", hash: undefined },
  { to: "/", label: "FAQ", hash: "faq" },
  { to: "/", label: "Contact", hash: "contact" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm md:flex">
            {NAV.map((n) => (
              <Link key={n.label} to={n.to} hash={n.hash} className="text-muted-foreground transition-colors hover:text-secondary">
                {n.label}
              </Link>
            ))}
            <Link to="/courses" className="border border-secondary bg-primary px-4 py-2 font-semibold not-italic text-primary-foreground hover:bg-secondary">
              Enroll now
            </Link>
          </nav>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-4 border-t border-border px-5 py-4 md:hidden">
            {NAV.map((n) => (
              <Link key={n.label} to={n.to} hash={n.hash} onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
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
    <div className="flex flex-wrap gap-3">
      <a href={CONTACT.whatsappUrl} target="_blank" rel="noreferrer" className="border border-secondary bg-primary px-5 py-3 font-semibold not-italic text-primary-foreground hover:bg-secondary">
        WhatsApp {CONTACT.whatsappDisplay}
      </a>
      <a href={CONTACT.telegramUrl} target="_blank" rel="noreferrer" className="border border-primary px-5 py-3 font-semibold not-italic text-secondary hover:bg-muted">
        Telegram @victorpromisee
      </a>
    </div>
  );
}
