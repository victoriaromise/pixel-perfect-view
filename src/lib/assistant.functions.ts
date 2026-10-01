import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { COURSES, CONTACT } from "./courses";

const Input = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) }))
    .min(1)
    .max(20),
});

function systemPrompt() {
  const list = COURSES.map(
    (c) =>
      `- ${c.title} (₦${c.price.toLocaleString()}): ${c.subtitle}. Topics: ${c.outline.join("; ")}. For: ${c.audience.join(", ")}.`,
  ).join("\n");
  return `You are the friendly, helpful assistant for VICTOR PROMISE, an AI training brand in Nigeria.
You can answer ANY question the visitor asks — about the courses, AI tools, prompting, content creation, business, tech, or general topics — clearly and accurately. Keep answers concise (usually under 150 words), use simple language and short lists when helpful. When relevant, gently mention which course fits their interest.
Courses:
${list}
How to enrol: tap a course flyer, sign up or sign in, pay by transfer to Opay ${CONTACT.opayAccount} (Victor Promise), then upload the receipt on the course page. An admin reviews it manually and access is granted after approval — never say payment is verified automatically.
Support: WhatsApp ${CONTACT.whatsappDisplay}, Telegram ${CONTACT.telegramUrl}.
Never invent course dates, discounts, or schedules; for those, suggest WhatsApp support.`;
}

async function viaLovable(key: string, messages: z.infer<typeof Input>["messages"]) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      instructions: systemPrompt(),
      input: messages.map((m) => ({ role: m.role, content: m.content })),
      reasoning: { effort: "low" },
      store: false,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) {
    console.error(`AI gateway failed [${res.status}]: ${await res.text()}`);
    return { status: res.status, text: "" };
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const ev = JSON.parse(payload);
        if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") text += ev.delta;
      } catch {
        /* ignore partial */
      }
    }
  }
  return { status: 200, text: text.trim() };
}

async function viaGemini(key: string, messages: z.infer<typeof Input>["messages"]) {
  const call = () =>
    fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt() }] },
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      }),
    });
  let res = await call();
  for (let i = 0; i < 2 && res.status === 503; i++) {
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    res = await call();
  }
  if (!res.ok) {
    console.error(`Gemini failed [${res.status}]: ${await res.text()}`);
    return { status: res.status, text: "" };
  }
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return { status: 200, text: json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "" };
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const googleKey = process.env["GOOGLE_API_KEY"];
    let result = { status: 0, text: "" };
    if (lovableKey) result = await viaLovable(lovableKey, data.messages);
    if (!result.text && googleKey) result = await viaGemini(googleKey, data.messages);
    if (result.text) return { reply: result.text };
    if (result.status === 429 || result.status === 503)
      return { reply: "I'm getting a lot of questions right now — please try again in a minute." };
    if (result.status === 402)
      return { reply: "The assistant is temporarily unavailable. Please message us on WhatsApp." };
    if (!lovableKey && !googleKey) return { reply: "The assistant isn't set up yet. Please message us on WhatsApp." };
    return { reply: "Sorry, I couldn't answer that right now. Please try again or message us on WhatsApp." };
  });
