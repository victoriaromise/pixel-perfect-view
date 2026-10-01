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
    { role: "assistant", content: "Hi! Ask me anything — about our AI courses, prices, how to enrol, or any AI question you have." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, open, busy]);

  // Prevent the page behind from scrolling on iPhone while chat is open (mobile only).
  useEffect(() => {
    if (!open || window.innerWidth >= 640) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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
    <div className="assistant-root fixed z-50">
      {open ? (
        <div className="assistant-panel flex flex-col overflow-hidden border border-border bg-card text-card-foreground shadow-xl sm:rounded-xl">
          <div className="flex shrink-0 items-center justify-between bg-primary px-4 py-2 text-primary-foreground">
            <span className="font-semibold">Course Assistant</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="grid h-11 w-11 place-items-center">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-card p-3 text-[15px] leading-relaxed [-webkit-overflow-scrolling:touch]">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="assistant-form flex shrink-0 gap-2 border-t border-border bg-card p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={2000}
              enterKeyHint="send"
              autoComplete="off"
              placeholder="Ask anything…"
              className="assistant-input min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ask a question"
          className="assistant-fab grid h-14 w-14 place-items-center rounded-full bg-primary font-semibold text-primary-foreground shadow-lg sm:flex sm:h-12 sm:w-auto sm:gap-2 sm:px-4"
        >
          <MessageCircle className="h-6 w-6 sm:h-5 sm:w-5" /> <span className="hidden sm:inline">Ask a question</span>
        </button>
      )}
    </div>
  );
}
