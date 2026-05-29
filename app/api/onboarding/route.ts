// POST /api/onboarding
// Creates a new onboarding session. Returns the token and the customer-facing URL.
// Called from the dashboard admin section when Jon clicks "New onboarding link".

import { createClient } from '@supabase/supabase-js';
import { isAdminRequest, pickWritableFields } from '@/lib/onboarding';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  // Only the authenticated admin may mint onboarding links.
  if (!(await isAdminRequest())) {
    return json({ error: 'unauthorized' }, 401);
  }

  const admin = createClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Optional: prefill fields Jon already knows. Whitelist to known columns so
  // the raw request body can't mass-assign arbitrary columns.
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // Body is optional — an empty POST is valid
  }
  const prefill = pickWritableFields(body, true);

  const { data, error } = await admin
    .from('onboarding_sessions')
    .insert([prefill])
    .select('token')
    .single();

  if (error || !data) {
    console.error('[onboarding] insert error:', error);
    return json({ error: 'failed to create session' }, 500);
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://relaydesk.com.au';
  const customerUrl = `${base}/onboard/${data.token}`;
  const adminUrl = `${customerUrl}?admin=1`;

  return json({ token: data.token, customerUrl, adminUrl }, 201);
}
