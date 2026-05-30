-- Activity feed: a normalised, DB-side filterable union of calls + voicemails.
-- The dashboard activity page queries this view directly so that filtering,
-- searching, sorting and pagination all happen in Postgres rather than by
-- pulling every row into the Node process and slicing in JavaScript.
--
-- Apply this file to Supabase (view + indexes) BEFORE deploying the rewritten
-- app/dashboard/activity/page.tsx. The page queries `activity_feed` and will
-- error until this migration has been run.

-- One row per call or voicemail, with the fields the feed needs.
-- outcome is the call outcome for calls, and the literal 'voicemail' for
-- voicemail rows. has_pending_callback is computed once here (EXISTS against
-- actions) so the page gets the per-row badge boolean without a second query.
-- security_invoker so the view respects the querying role's RLS rather than the
-- creator's (Supabase flags the default SECURITY DEFINER as an error). Needs PG15+.
create or replace view activity_feed with (security_invoker = on) as
select
  'call'::text        as kind,
  c.id                as id,
  c.customer_id       as customer_id,
  c.caller_phone      as phone,
  c.started_at        as at,
  c.duration_s        as duration,
  c.outcome::text     as outcome,  -- calls.outcome is the call_outcome enum; cast so the UNION matches the voicemail branch's text
  null::text          as recording_sid,
  exists (
    select 1
    from actions a
    where a.call_id = c.id
      and a.type = 'callback'
      and a.status = 'pending'
  )                   as has_pending_callback
from calls c
union all
select
  'voicemail'::text       as kind,
  v.id                    as id,
  v.customer_id           as customer_id,
  v.twilio_from_number    as phone,
  v.created_at            as at,
  v.duration_seconds      as duration,
  'voicemail'::text       as outcome,
  v.twilio_recording_sid  as recording_sid,
  false                   as has_pending_callback
from voicemails v;

-- Indexes backing the per-customer, time-ordered window scans the view drives.
create index if not exists calls_customer_started_at_idx
  on calls (customer_id, started_at desc);

create index if not exists voicemails_customer_created_at_idx
  on voicemails (customer_id, created_at desc);

-- Partial index for the has_pending_callback EXISTS probe: only pending
-- callback actions are ever matched, so the index stays small.
create index if not exists actions_pending_callback_call_id_idx
  on actions (call_id)
  where type = 'callback' and status = 'pending';
