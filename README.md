# RelayDesk

AI phone agent for Australian local businesses. Run your business, not your phone.

## About

RelayDesk answers every inbound call for owner-operated local businesses in Australia — capturing orders, handling questions, booking callbacks, and transferring when needed.

**Stack**: Next.js 16 App Router · Tailwind CSS · Framer Motion · Supabase · ElevenLabs · Twilio · Vercel

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key routes

- `/` — Marketing site (single-page)
- `/dashboard` — Customer dashboard (Supabase magic-link auth)
- `/auth/*` — Auth flow
- `/api/*` — Webhook handlers (Twilio, ElevenLabs, Resend)
- `/privacy` — Privacy policy
