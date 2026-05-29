import { createClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL } from '@/lib/constants';

// Columns a customer (unauthenticated token holder) is allowed to write via
// the onboarding form. Everything else (id, token, timestamps, internal_notes)
// is off-limits to non-admins. internal_notes is admin-only.
export const CUSTOMER_WRITABLE_FIELDS = [
  'business_name',
  'owner_name',
  'industry',
  'owner_email',
  'owner_mobile',
  'existing_phone',
  'new_number_needed',
  'services',
  'pricing_approach',
  'hours',
  'service_area',
  'top_questions',
  'info_capture',
  'callback_offer',
  'callback_slots',
  'transfer_mobile',
  'summary_email',
  'customer_confirmation',
  'additional_notes',
  'agent_name',
  'agent_voice',
  'call_handling_preference',
  'escalation_conditions',
  'callback_commitment',
  'call_volume',
  'success_metrics',
] as const;

// Fields only the authenticated admin may read or write.
export const ADMIN_ONLY_FIELDS = ['internal_notes'] as const;

// True only when the request carries an authenticated Supabase session for the
// admin account. The customer-facing onboarding link has no session, so this is
// always false for them.
export async function isAdminRequest(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

// Keep only the keys an actor is allowed to write.
export function pickWritableFields(
  body: Record<string, unknown>,
  isAdmin: boolean
): Record<string, unknown> {
  const allowed = new Set<string>(CUSTOMER_WRITABLE_FIELDS);
  if (isAdmin) ADMIN_ONLY_FIELDS.forEach(f => allowed.add(f));
  return Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.has(k))
  );
}

// Strip admin-only fields from a record before sending it to a non-admin.
export function stripAdminFields<T extends Record<string, unknown>>(
  row: T,
  isAdmin: boolean
): Record<string, unknown> {
  if (isAdmin) return row;
  const out = { ...row };
  ADMIN_ONLY_FIELDS.forEach(f => delete out[f]);
  return out;
}
