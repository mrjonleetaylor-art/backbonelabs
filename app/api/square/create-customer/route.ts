import { createClient } from '@supabase/supabase-js';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';

// --- Auth (same Bearer-or-bare pattern as order-status / check-item) ---

function checkAuth(req: Request): boolean {
  const expectedToken = process.env.ELEVENLABS_TOOL_SECRET;
  if (!expectedToken) return false;
  const authHeader = req.headers.get('authorization') ?? '';
  // ElevenLabs sends the workspace secret value verbatim. Tolerate both
  // "Bearer <token>" and the bare "<token>" forms.
  const candidates = [`Bearer ${expectedToken}`, expectedToken];
  for (const expected of candidates) {
    if (authHeader.length !== expected.length) continue;
    try {
      if (crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))) {
        return true;
      }
    } catch {
      // length mismatch from Buffer.from, ignore
    }
  }
  return false;
}

// --- Types ---

type CustomerRow = {
  id: string;
  square_access_token: string | null;
  square_location_id: string | null;
};

// --- Helpers ---

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const FALLBACK = {
  created: false,
  customer_id: null,
  summary:
    "I couldn't save those details right now — the florist team will follow up.",
};

// Normalise a phone number toward E.164 so it dedupes against the caller ID
// that pre-call searches by. Caller ID arrives already E.164 (+61...); the
// spoken fallback may be a local AU format. Best-effort, AU-biased.
function normalisePhone(raw: string): string | null {
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (cleaned.length < 6) return null;
  if (cleaned.startsWith('+')) return cleaned;
  // AU mobile/landline entered with leading 0 -> +61
  if (cleaned.startsWith('0')) return `+61${cleaned.slice(1)}`;
  // bare country code without +
  if (cleaned.startsWith('61')) return `+${cleaned}`;
  // unknown shape: prefix + and hope Square's E.164 coercion handles it
  return `+${cleaned}`;
}

function makeSquareClient(token: string) {
  return new SquareClient({
    token,
    environment:
      process.env.SQUARE_ENVIRONMENT === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });
}

// --- Entry point ---

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return json({ error: 'unauthorized' }, 401);
  }

  let body: {
    agent_id?: string;
    given_name?: string;
    family_name?: string;
    phone_number?: string;
    email?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json(FALLBACK);
  }

  const { agent_id, given_name, family_name, phone_number, email } = body;

  if (!agent_id) {
    return json(FALLBACK);
  }

  // Need at least a name to create a meaningful record. If the caller refused
  // to give a name, Sally shouldn't have called this tool at all (prompt rule),
  // but guard anyway.
  const givenName = given_name?.trim();
  if (!givenName) {
    return json({
      created: false,
      customer_id: null,
      summary: 'No name was captured, so no customer record was created.',
    });
  }

  const normalisedPhone = phone_number ? normalisePhone(phone_number) : null;
  const familyName = family_name?.trim() || undefined;
  const emailAddress = email?.trim() || undefined;

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: customer, error } = await supabase
    .from('customers')
    .select('id, square_access_token, square_location_id')
    .eq('elevenlabs_agent_id', agent_id)
    .maybeSingle<CustomerRow>();

  if (error || !customer?.square_access_token) {
    console.error('[create-customer] customer lookup failed or missing Square credentials', {
      agent_id,
      error: error?.message,
    });
    return json(FALLBACK);
  }

  const squareClient = makeSquareClient(customer.square_access_token);

  try {
    // 1. Dedupe: search by phone first. Square phone search is eventually
    //    consistent, so this catches the common case but is NOT the only guard
    //    against duplicates — the deterministic idempotency key below covers
    //    the rapid-double-call race.
    if (normalisedPhone) {
      const search = await squareClient.customers.search({
        query: { filter: { phoneNumber: { exact: normalisedPhone } } },
        limit: BigInt(1),
      });
      const existing = search.customers?.[0];
      if (existing?.id) {
        return json({
          created: false,
          customer_id: existing.id,
          summary: `Existing customer record found for ${existing.givenName ?? givenName}.`,
        });
      }
    }

    // Random idempotency key — duplicate prevention is handled by the phone
    // dedupe-search above. A deterministic key caused IDEMPOTENCY_KEY_REUSED
    // failures on any recycled phone number.
    const idempotencyKey = crypto.randomUUID();

    const result = await squareClient.customers.create({
      idempotencyKey,
      givenName,
      familyName,
      phoneNumber: normalisedPhone ?? undefined,
      emailAddress,
    });

    const created = result.customer;
    if (!created?.id) {
      console.error('[create-customer] Square returned no customer', { agent_id });
      return json(FALLBACK);
    }

    return json({
      created: true,
      customer_id: created.id,
      summary: `Customer record saved for ${created.givenName ?? givenName}.`,
    });
  } catch (err) {
    console.error('[create-customer] Square Customers API error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return json(FALLBACK);
  }
}
