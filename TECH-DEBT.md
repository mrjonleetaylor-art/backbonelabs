# RelayDesk tech debt audit

Date: 30 May 2026. Scope: `relaydesk-web` (Next.js 16, Supabase, Twilio, ElevenLabs, Square, Resend, Google Calendar). Solo founder, no tests, deploys to Vercel.

Scoring: `Priority = (Impact + Risk) x (6 - Effort)`, each on 1-5. Higher is more urgent.

## Headline finding

**P0 resolved 1 June 2026 — dashboard 1000-row count cap.** The PostgREST 1000-row default cap was silently under-reporting the main dashboard KPIs (`app/dashboard/page.tsx`): "Calls answered", the last-week comparison, and the agent-handled % were all derived from `select().length`, so a shop with >1000 calls in the window would see wrong numbers with no error. Converted to exact head-counts (`{ count: 'exact', head: true }`); non-transfer now computed as total minus transfers (preserves the old null-outcome-counts-as-non-transfer semantics); the Outstanding KPI now shows the true count rather than being capped at the list's `.limit(4)`. The activity table was already fixed earlier (commit `379ee31`, `activity_feed` view + `.range()` pagination + exact count + `ilike` search + clamped `since`), so `DASHBOARD-ROBUSTNESS.md`'s activity-page section is stale. tsc + eslint clean; **build + deploy from local pending** (sandbox is arm64, can't run the Next 16 build).

Resolved 30 May 2026. Issue 4 from the codex P0 prompt (the AEDT timezone fix) is now done: `lib/time.ts` exists and keys all conversions to `Australia/Sydney` via `date-fns-tz`, and the hardcoded `+10:00` offsets are gone from `calendar/availability`, `cron/daily-digest`, and `elevenlabs-webhook`. Verified: no `+10:00` literals remain anywhere in `app`, and a 09:00 Sydney time converts to `22:00Z` in October (AEDT +11) versus `23:00Z` in May (AEST +10), one hour earlier as required. All four codex P0s are now closed (onboarding auth via `isAdminRequest`, the PATCH allowlist via `pickWritableFields`, recording ownership via the RLS-backed `voicemails` lookup, and now the timezone fix).

## Prioritised backlog

| # | Item | Category | I | R | E | Priority |
|---|------|----------|---|---|---|----------|
| 0 | **P0 — 1000-row cap on dashboard KPI counts** (FIXED 2026-06-01, awaiting local build + deploy) | Code / correctness | 5 | 4 | 1 | P0 |
| 1 | AEDT `+10:00` bug, no `lib/time.ts` | Code / correctness | 4 | 5 | 2 | 36 |
| 2 | Hardcoded admin email in 3 places, no single helper | Code / security | 2 | 3 | 1 | 25 |
| 3 | No CI (lint + build run by hand) | Infrastructure | 3 | 3 | 2 | 24 |
| 4 | `json()` helper copy-pasted across 13 routes | Code | 3 | 2 | 2 | 20 |
| 5 | No request validation library (manual allowlists, untyped bodies) | Code | 3 | 3 | 3 | 18 |
| 6 | No rate limiting on public endpoints | Architecture / cost | 3 | 3 | 3 | 18 |
| 7 | 724-line `elevenlabs-webhook` route | Code / architecture | 3 | 3 | 3 | 18 |
| 8 | Service-role key in 18 routes, no RLS-backed client | Architecture / security | 4 | 4 | 4 | 16 |
| 9 | Zero automated tests | Test | 4 | 4 | 4 | 16 |
| 10 | No structured logging or monitoring | Infrastructure | 2 | 3 | 3 | 15 |
| 11 | Stale `?admin=1` copy in OnboardingForm | Documentation | 1 | 1 | 1 | 10 |

## Detail and justification

**0. P0 — 1000-row cap on dashboard counts (FIXED 2026-06-01).** Flagged by Jon as a P0: a busy shop exceeds the PostgREST 1000-row default and the dashboard silently under-reports. Investigation found the activity page was already fixed (commit `379ee31`: DB-side `activity_feed` view, `.range()` pagination, `ilike` search, exact head count, `since` clamped to 90 days). The live bug was the main dashboard KPIs in `app/dashboard/page.tsx`, which counted via row `.length`: "Calls answered" and "Calls you didn't have to take" truncated at 1000, and "Outstanding" was capped at 4 (it counted a `.limit(4)` list). Fix: switched all four KPI numbers to `count: 'exact', head: true`; list queries (recent calls, pending actions, appointments) still return bounded rows. Non-transfer count preserves the prior null-outcome semantics via `.or('outcome.neq.transfer,outcome.is.null')`. `tsc --noEmit` clean. **Remaining: `npm run build` locally (sandbox is arm64, can't run Next 16 Turbopack) then deploy.** Reliability gaps from `DASHBOARD-ROBUSTNESS.md` (failed queries render as empty data; no `error.tsx`/`loading.tsx`) are NOT in this fix and remain open — recommend tracking as the next P1.

**1. AEDT timezone bug.** `+10:00` is hardcoded in `app/api/calendar/availability/route.ts` (lines 42, 60-61, 138-139), `app/api/cron/daily-digest/route.ts` (lines 41-42), and `app/api/elevenlabs-webhook/route.ts` (lines 443, 460). After 4 October, availability windows, digest day boundaries, and callback due times all land an hour off. Customer-facing and silent. The codex prompt already specified the fix: add `lib/time.ts` keyed to IANA `Australia/Sydney` (`date-fns-tz` is already in `package.json`), with a local-to-UTC and a UTC-to-Sydney helper, then replace every offset. Low effort, high payoff, do it first.

**2. Admin model duplication.** The owner email `mr.jonleetaylor@gmail.com` is hardcoded inline at `app/dashboard/layout.tsx:45`, again as `ADMIN_EMAIL` in `lib/constants.ts:8`, and gating logic lives in `lib/onboarding.ts` (`isAdminRequest`). The codex prompt asked for one `isAdmin` helper consumed everywhere; layout.tsx still does its own inline string compare. Cheap to consolidate, removes a footgun when the admin model eventually changes.

**3. No CI.** Lint and build pass only when run manually. For a solo founder shipping to Vercel, a single GitHub Action running `npm run lint` and `npm run build` on push is the highest-leverage guardrail available and prevents the AEDT-class regression from recurring unseen.

**4. Duplicated `json()` helper.** Thirteen API routes each define their own `json()` response wrapper. `refreshAccessToken()` is duplicated across the two calendar routes, and `esc()` across three. Extract to `lib/http.ts` and `lib/calendar/` once. The codex prompt deferred this deliberately, which was correct for that scoped task; it belongs on the backlog now.

**5. No request validation.** No zod or equivalent. The onboarding PATCH allowlist (`pickWritableFields`) is a hand-maintained string array, and webhook and API bodies are untyped. A schema layer would harden the allowlist and give typed payloads in one move. Start with the highest-traffic untrusted inputs (onboarding PATCH, callback-request, book-meeting).

**6. No rate limiting.** `callback-request`, `book-meeting`, and the onboarding token PATCH are public and trigger paid actions (Twilio SMS, Resend email, ElevenLabs). Without throttling these are an open cost and abuse vector. Vercel or Upstash rate limiting on the three public write paths closes it.

**7. Oversized webhook route.** `elevenlabs-webhook/route.ts` is 724 lines and carries signature verification, parsing, and several side effects. Hard to test or change safely. Signature verification and Twilio verification are correctly implemented, so this is structure not security. Split into handler plus extracted units when you next touch it; not urgent on its own.

**8. Service-role key everywhere.** 18 routes instantiate Supabase with `SUPABASE_SERVICE_ROLE_KEY`, bypassing row-level security. Any logic slip in any route can read or write across tenants. The codex prompt flagged this as separate work, correctly. It is high risk but high effort (needs an RLS-backed client and per-route audit), so it sits below the cheap wins. Plan it as its own phase, do not boil the ocean.

**9. Zero tests.** No test runner. The riskiest untested surfaces are the new `lib/time.ts` (once it exists), the PATCH allowlist, and the two webhook signature verifiers. Stand up Vitest and write those three first rather than chasing coverage.

**10. No observability.** Seven scattered `console.log`/`console.warn` calls, no structured logging, no alerting. Silent failures in cron or webhooks go unnoticed. You have a Datadog connector available; even Vercel log drains plus a cron heartbeat would be a step up.

**11. Stale `?admin=1` copy.** `OnboardingForm.tsx:315` still tells users the section appears with `?admin=1`. The mechanism was correctly replaced with an authenticated admin session, so this is dead copy, not a security hole. One-line delete.

## Phased remediation

**Phase 1, this week, ship alongside features.** Items 1, 2, 3, 11. The AEDT fix is the hard deadline (before October, ideally now while you can verify against an October test date as the prompt describes). Fold in the admin helper consolidation, a CI action, and the stale-copy delete while you are in there. All low effort.

**Phase 2, next month.** Items 4, 5, 6. Extract shared helpers, introduce a validation schema on the public write paths, add rate limiting to the three paid endpoints. Each is a contained change.

**Phase 3, dedicated block.** Items 8, 9, 7, 10. The RLS migration and test foundation are real projects, not interstitial work. Do the service-role audit and the first tests together so the migration is verifiable, then tackle the webhook split and observability.

Items left unscored as non-debt: Next 16 / React 19 and the deliberately pinned `SQUARE_API_VERSION` are current and intentional, not debt.
