// GET  /api/onboarding/[token] — read session
// PATCH /api/onboarding/[token] — autosave fields

import { createClient } from '@supabase/supabase-js';
import { isAdminRequest, pickWritableFields, stripAdminFields } from '@/lib/onboarding';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type Params = { token: string };

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { token } = await params;
  const admin = adminClient();

  const { data, error } = await admin
    .from('onboarding_sessions')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (error) {
    console.error('[onboarding GET] error:', error);
    return json({ error: 'server error' }, 500);
  }
  if (!data) return json({ error: 'not found' }, 404);

  // Only the authenticated admin sees internal_notes.
  const isAdmin = await isAdminRequest();
  return json(stripAdminFields(data, isAdmin));
}

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const { token } = await params;
  const admin = adminClient();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  // Whitelist writable columns. Customers can write their own form fields only;
  // internal_notes is writable only by the authenticated admin. This blocks
  // mass-assignment of id/token/timestamps and tampering with admin fields.
  const isAdmin = await isAdminRequest();
  const fields = pickWritableFields(body, isAdmin);

  if (Object.keys(fields).length === 0) {
    return json({ error: 'no writable fields' }, 400);
  }

  const { error } = await admin
    .from('onboarding_sessions')
    .update(fields)
    .eq('token', token);

  if (error) {
    console.error('[onboarding PATCH] error:', error);
    return json({ error: 'failed to save' }, 500);
  }

  return json({ ok: true });
}
