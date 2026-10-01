# Make the chatbot answer visitors on the Vercel site

## Goal
The chatbot on https://aimastercourse-nu.vercel.app should answer visitors, not just on the Lovable preview.

## How it works today
- The chatbot first tries Lovable's built-in AI. That only exists on Lovable hosting, so on Vercel it fails and falls back to your Google AI Studio key.
- Your Google key is stored safely in Lovable, but Vercel cannot see it. Vercel needs its own copy as an environment variable.

## Steps

### 1. You add the key in Vercel (only you can do this)
1. Open your Vercel project → Settings → Environment Variables.
2. Add: Name `GOOGLE_API_KEY`, Value = your Google AI Studio key (the same one you saved in Lovable — I cannot see or copy secret values, so paste it from your own records).
3. Apply to Production (and Preview if you like), then redeploy (Deployments → Redeploy).

### 2. I verify the chatbot code works on Vercel
- Check that the chat request on Vercel correctly falls back to the Google key when Lovable AI is unavailable.
- Make sure errors show a friendly message instead of a broken widget.
- Confirm the chat window behaves well on iPhone (no zoom when typing, fits the screen, readable colors).

### 3. Test
- After your redeploy, I test the live Vercel site: open the chat, ask a course question, confirm a real answer comes back.

## Technical details
- Server function: `src/lib/assistant.functions.ts` reads `process.env['GOOGLE_API_KEY']` inside the handler — no code change needed for the key itself, only the Vercel setting.
- Chat widget: `src/components/site/CourseAssistant.tsx`.
- Note: server functions on Vercel depend on Vercel running the app's server code; if the live test shows the chat endpoint isn't served on Vercel, the fix is a small code change to call the Google AI API directly from the browser with a restricted key — I'll confirm with you before doing that.
