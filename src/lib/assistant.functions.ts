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
  return `You are the friendly course assistant for VICTOR PROMISE, an AI training brand in Nigeria.
Answer questions about the courses briefly and clearly (under 120 words). Courses:
${list}
How to enrol: create an account, pay by transfer to Opay ${CONTACT.opayAccount} (Victor Promise), then upload the receipt on the course page. An admin reviews it manually; access is granted after approval — never say payment is verified automatically.
Support: WhatsApp ${CONTACT.whatsappDisplay}, Telegram ${CONTACT.telegramUrl}.
If you don't know something, suggest contacting support on WhatsApp. Don't invent dates, discounts, or schedules.`;
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["GOOGLE_API_KEY"];
    if (!key) throw new Error("Assistant is not configured");
    const call = () => fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt() }] },
          contents: data.messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        }),
      },
    );
    let res = await call();
    for (let i = 0; i < 2 && res.status === 503; i++) {
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
      res = await call();
    }
    if (!res.ok) {
      const body = await res.text();
      console.error(`Gemini failed [${res.status}]: ${body}`);
      if (res.status === 429 || res.status === 503) return { reply: "I'm getting a lot of questions right now — please try again in a minute." };
      throw new Error(`Assistant unavailable [${res.status}]`);
    }
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const reply =
      json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ||
      "Sorry, I couldn't answer that. Please reach us on WhatsApp.";
    return { reply };
  });
