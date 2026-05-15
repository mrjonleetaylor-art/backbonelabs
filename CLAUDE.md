# RelayDesk - CLAUDE.md

## About this project
RelayDesk (relaydesk.com.au) is an AI phone agent service 
for owner-operated local businesses in Australia. We answer every 
inbound call using ElevenLabs voice AI + Claude API + Twilio.

Three tiers: Overflow ($99), Receptionist ($399), Operator ($699). No setup fees.

The demo agent is called Thomas Anderson (Tom). Prospects call 
the RelayDesk number, speak to Tom, and think he is a real 
person. The reveal happens on the demo call. Never break this 
illusion anywhere on the website or in copy.

## How we work
- Scaffold, create files, install packages, run dev server 
  without asking
- Do not ask for confirmation on routine tasks - do it and 
  report back
- If you hit a blocker, state it clearly and give 2 options
- Prefer simple and working over clever and complex
- Mobile-first always - design for 375px first
- Push back if a change breaks brand rules, hurts conversion, 
  or breaks the Thomas Anderson illusion
- Run npm run lint and npm run build after every change. 
  Both must pass before reporting back.

## Stack
- Next.js App Router
- Tailwind CSS
- Framer Motion for animations
- Deployed on Vercel
- Single scrolling page + /privacy route

## Shared constants
- lib/constants.ts - MONTHLY_PRICE, tier prices
- lib/contact.ts - PHONE_DISPLAY, PHONE_HREF, EMAIL_HREF
- Never hardcode prices, phone numbers, or email addresses

## Contact details
- Phone: 02 5302 3030 (tel:+61253023030)
- Email: hello@relaydesk.com.au
- Domain: relaydesk.com.au

## Colour system
- Background: #FFFFFF
- Surface: #F8FAFC
- Text primary: #0F172A
- Text muted: #64748B
- Primary accent: #6366F1 violet - buttons, CTAs
- Secondary accent: #06B6D4 cyan - icons, step numbers, badges
- Solid violet sections: #6366F1 - "Before you scroll" + Final CTA only
- Dark navy: #0F172A - Footer only
- No pure black. No pure white. No green.

## Typography
- Font: Inter
- No serif fonts anywhere
- No em dashes anywhere - use hyphen or rewrite the sentence
- Australian English throughout
- Sentence case for all headings and CTAs

## Pricing tiers
| Tier | Monthly | Calls |
|------|---------|-------|
| Overflow | $99 | 150/month |
| Receptionist | $399 | 300/month |
| Operator | $699 | 1,000/month |

- Overage: $1/call on all tiers
- Payment links standard on all tiers (1.2% + 30c)
- Referral: refer a customer, you both get a free month
- Receptionist is most popular - highlight it

## CTA rules
- Primary: "Give us a call" -> tel:+61253023030
- Secondary: "Request a callback" -> mailto:hello@relaydesk.com.au
- Never use "demo", "agent", or "AI" in any CTA label
- Never break the Thomas Anderson illusion

## Page sections in order (homepage)
1. Nav - floating pill, anchor links, hamburger on mobile
2. Hero - left text, right cycling iMessage transcript widget
3. "Before you scroll, give us a call" - solid violet, full viewport
4. Problem + Sheena quote - combined, fades from white to image
5. How it works / Process - 5-step interactive timeline
6. What RelayDesk handles - 6 capability cards
7. Sample calls - 4-5 audio players with scenario labels (no autoplay)
8. ROI calculator - 4 sliders
9. Pricing - three tiers
10. FAQ - accordion
11. Final CTA
12. Footer

## Execution plan
See `../relaydesk/Execution Plan.md` — that is the single source of truth.
Website tasks live under "Parallel — Website conversion audit" in that doc.

## Thomas Anderson
- Lives in the demo call section only
- Never mentioned by name in CTAs or nav
- The site converts by making people call the number
- RelayDesk is the hero, not Thomas

## Brand rules - enforce always
- No em dashes
- No mention of AI, demo, or agent in CTAs or call section
- RelayDesk is the hero, not Thomas Anderson
- All copy in Australian English
- Sentence case for all headings and CTAs

## Do not
- Add pages not listed in the execution plan above
- Use stock photos or AI-generated imagery
- Auto-play audio or video
- Over-engineer anything
- Ask for approval on bug fixes or copy changes
- Proceed with structural changes without asking first
- Invent features on industry pages that don't exist in the product
