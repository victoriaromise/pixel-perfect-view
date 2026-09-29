import { useRef, useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { askAssistant } from "@/lib/assistant.functions";

type Msg = { role: "user" | "assistant"; content: string };

export function CourseAssistant() {
  const ask = useServerFn(askAssistant);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I can answer questions about our AI courses, prices and how to enrol. What would you like to know?" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await ask({ data: { messages: next.slice(1).slice(-20) } });
      setMsgs((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Sorry, something went wrong. Please try again or message us on WhatsApp." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-3 right-3 z-50 sm:bottom-4 sm:right-4">
      {open ? (
        <div className="flex h-[min(32rem,calc(100dvh-5.5rem))] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:h-[28rem] sm:w-[22rem]">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <span className="font-semibold">Course Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="grid h-11 w-11 place-items-center"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-border p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={2000}
              placeholder="Ask about a course…"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button type="submit" disabled={busy} aria-label="Send" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask a course question"
          className="grid h-12 w-12 place-items-center rounded-full bg-primary font-semibold text-primary-foreground shadow-lg sm:flex sm:w-auto sm:gap-2 sm:px-4"
        >
          <MessageCircle className="h-5 w-5" /> <span className="hidden sm:inline">Ask a question</span>
        </button>
      )}
    </div>
  );
}
