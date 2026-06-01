# Dashboard robustness and scalability review

Date: 30 May 2026. Scope: the authenticated dashboard (`app/dashboard/*`) and the queries feeding it. Question being answered: was this built robustly and future-proofed for growth and reliability?

> **Update 1 June 2026:** Two of the scaling issues below are now fixed. (1) The activity page was rebuilt in commit `379ee31` to page in the database via the `activity_feed` view (`.range()` pagination, exact count, `ilike` search, `since` clamped to 90 days), so the "What breaks first: the activity page" section is **stale** — it describes the pre-fix state. (2) The main-dashboard KPI counts ("Counting by fetching", below) were converted to exact head-counts on 1 June, removing the 1000-row under-report. The reliability gaps (failed-queries-look-like-empty-data, no `error.tsx`/`loading.tsx`) and the tenant-isolation/RLS point below are **still open**.

## Verdict

The dashboard is clean, well-componentised, and correct at current volume. It is not yet built for growth. The data layer assumes small per-customer datasets: it fetches whole windows of rows into memory and counts and paginates in JavaScript. That works for a customer with dozens of calls and quietly degrades, then breaks, somewhere in the hundreds to low thousands. Reliability has real gaps too: failed queries are indistinguishable from empty data, and there are no error or loading boundaries. None of this is hard to fix, but it should be fixed before you onboard customers with real call throughput.

## What breaks first: the activity page

`app/dashboard/activity/page.tsx` is the weakest point and the one that will fail soonest.

It fetches every call and every voicemail since the `since` date (default 7 days, but user-controllable), merges and sorts them in JavaScript, filters search in JavaScript, then slices 25 rows for the page. Pagination happens after the full window is already pulled into memory. Three consequences:

- **It does not scale.** Page 4 of the activity table loads exactly the same full dataset as page 1, just to throw most of it away. Memory and query time grow with total volume, not page size. The `PAGE_SIZE = 25` is cosmetic.
- **Supabase silently caps at 1000 rows.** PostgREST returns at most 1000 rows per query by default. Once a customer has more than 1000 calls in the selected window, the table silently truncates, the "Load more" pagination stops being correct, and counts drift. No error is thrown.
- **Search is subtly broken.** `search` is a JavaScript `phone.includes()` over only the rows already fetched in the date window, not a database query. Searching for a number outside the current `since` window returns nothing even though the record exists. Users will read that as "the data is missing".

`since` is also unbounded user input. `params.since` goes straight into the query with no max range or validation, so `?since=1970-01-01` forces a full-history scan. `new Date(since)` on a malformed value yields an Invalid Date that the query handles unpredictably.

The fix is to push filtering, sorting, and pagination into the query: use `.range(offset, offset + PAGE_SIZE - 1)`, filter `caller_phone` with an `ilike` in the database, clamp `since` to a sane maximum, and get the total from a `count: 'exact', head: true` query rather than `array.length`. The merge of calls and voicemails into one feed is the only genuinely tricky part, because they are separate tables; either a database view or a union query keeps pagination honest.

## Counting by fetching

The main dashboard derives KPIs by selecting rows and reading `.length`: `thisWeekCalls`, `lastWeekCalls`, the non-transfer split. This pulls rows purely to count them and is subject to the same 1000-row ceiling, so the "calls answered" number will under-report for a busy week. The correct pattern already exists in the codebase: `layout.tsx` counts the pending-actions badge with `count: 'exact', head: true`. Use that everywhere a number is shown and stop materialising rows to count them.

## Reliability gaps

- **Failed queries look like empty data.** Almost every query destructures `{ data }` and ignores `error`. On a Supabase hiccup, `data` is null and the UI renders "No calls yet this week" or "Nothing outstanding". An outage is indistinguishable from a quiet week, which is corrosive to trust in a product whose whole pitch is "we caught your calls". Capture `error` and render a distinct degraded state.
- **No error boundary.** There is no `app/dashboard/error.tsx`. An unhandled throw in any server component takes out the whole dashboard with the default error screen rather than a scoped, recoverable message.
- **No loading state.** There is no `loading.tsx` and no Suspense. Each page blocks on its slowest query before first paint. Queries within a page are parallelised with `Promise.all`, which is good, but the user sees nothing until all of them resolve. A skeleton plus streaming would make it feel instant and isolate a slow query.
- **No caching intent.** These renders are dynamic (cookie and auth based), so every dashboard view runs the full query set against the database with no revalidation window. Fine for correctness, but there is no stale-while-revalidate and no declared strategy, so traffic scales linearly with page views.

## Tenant isolation rests on discipline alone

Every dashboard query uses the Supabase service-role key, which bypasses row-level security. Isolation between customers depends entirely on every query remembering `.eq('customer_id', customer.id)`. Today they all do. But there is no second line of defence: one forgotten filter in one new route leaks another customer's calls, and nothing at the database level would stop it. As the surface grows, the odds of that slip grow with it. Moving dashboard reads to an RLS-backed client (the anon client already exists in `lib/supabase/server.ts`, it is just not used for data) would make the database enforce isolation regardless of application bugs. This is the highest-value structural change for a multi-customer future.

## Smaller things

- The customer record is looked up again in every page via `auth.getUser()` then a `customers` select, on top of the same lookup in the layout. These are not deduplicated, so each navigation costs a couple of round trips before any real data loads. Wrapping the lookup in React `cache()` or a shared helper would remove the repetition.
- The callback-versus-question distinction is derived in JavaScript (both map to `outcome = 'info'`, then re-split via a separate actions query), which is part of what forces the in-memory filtering. Storing the distinction, or a view that exposes it, would let the database do the filtering.
- Transcripts are stored as JSON strings and parsed per row with try/catch against an assumed `{ role, message }` shape. It works, but it is untyped and brittle as the agent output evolves.

## What is genuinely solid

Queries within a page are parallelised properly. Every query is tenant-scoped. The pending badge uses a real count query. Calendar lists are bounded with sensible limits and the appointments query only runs when calendar is connected. It is all server components with no client-side fetch waterfall, and the component structure is clean and easy to change. The bones are good; the data access patterns are what need maturing.

## Recommended order

1. Rebuild activity-page querying: database-side filter, sort, `.range()` pagination, real counts, clamped `since`. This removes the only path that actually breaks. (Pairs with deciding how to page the merged call plus voicemail feed.)
2. Switch KPI and list counts to `count: 'exact', head: true`. Small, removes the silent under-reporting.
3. Add `error.tsx`, `loading.tsx`, and surface query errors as a degraded state rather than empty data. Cheap, big reliability and trust win.
4. Move dashboard reads to an RLS-backed client so isolation is enforced by the database. Larger, but the right foundation before scaling customer count.
5. Tidy the repeated customer lookup and consider realtime or a revalidation window once volume justifies it.
