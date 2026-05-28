import { createClient } from '@supabase/supabase-js';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';

// --- Signature validation — mirrors /api/elevenlabs-webhook exactly ---

function parseSignatureHeader(
  header: string | null
): { timestamp: string; signature: string } | null {
  if (!header) return null;
  const parts = header.split(',').reduce(
    (acc, part) => {
      const idx = part.indexOf('=');
      if (idx > 0) acc[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
      return acc;
    },
    {} as Record<string, string>
  );
  if (!parts.t || !parts.v0) return null;
  return { timestamp: parts.t, signature: parts.v0 };
}

function verifySignature(timestamp: string, rawBody: string, signature: string): boolean {
  if (!process.env.ELEVENLABS_WEBHOOK_SECRET) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 1800) return false;
  const expected = crypto
    .createHmac('sha256', process.env.ELEVENLABS_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// --- Types ---

type CustomerRow = {
  id: string;
  square_access_token: string | null;
  square_location_id: string | null;
};

type DynamicVariables = {
  caller_name: string | null;
  square_customer_id: string | null;
  has_recent_order: string;
  recent_order_summary: string | null;
  recent_order_paid: string | null;
};

// --- Helpers ---

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const ANONYMOUS: DynamicVariables = {
  caller_name: null,
  square_customer_id: null,
  has_recent_order: 'false',
  recent_order_summary: null,
  recent_order_paid: null,
};

function anonymousResponse() {
  return json({ dynamic_variables: ANONYMOUS });
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
  const t0 = Date.now();
  const rawBody = await req.text();

  const sigHeader = req.headers.get('elevenlabs-signature');
  const parsed = parseSignatureHeader(sigHeader);
  if (!parsed || !verifySignature(parsed.timestamp, rawBody, parsed.signature)) {
    return json({ error: 'invalid signature' }, 401);
  }

  let body: { agent_id?: string; caller_id?: string | null; call_id?: string };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  const { agent_id, caller_id, call_id } = body;

  console.log('[pre-call] received', {
    agent_id,
    has_caller_id: Boolean(caller_id),
    call_id,
  });

  if (!caller_id) {
    console.log('[pre-call] no caller_id, returning anonymous defaults');
    return anonymousResponse();
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, square_access_token, square_location_id')
    .eq('elevenlabs_agent_id', agent_id)
    .maybeSingle<CustomerRow>();

  if (customerError) {
    console.error('[pre-call] customer lookup error', {
      agent_id,
      error: customerError.message,
    });
    return anonymousResponse();
  }

  if (!customer?.square_access_token) {
    console.log('[pre-call] no square_access_token, returning anonymous defaults', { agent_id });
    return anonymousResponse();
  }

  const squareClient = makeSquareClient(customer.square_access_token);

  try {
    const tSquare = Date.now();

    // Step 1 — look up Square customer by phone (E.164 from Twilio)
    const customerSearchResult = await squareClient.customers.search({
      query: {
        filter: {
          phoneNumber: { exact: caller_id },
        },
      },
    });

    const squareCustomers = customerSearchResult.customers ?? [];

    if (squareCustomers.length === 0) {
      console.log('[pre-call] caller not in Square', {
        latency_ms: Date.now() - tSquare,
      });
      return anonymousResponse();
    }

    const squareCustomer = squareCustomers[0];
    const squareCustomerId = squareCustomer.id ?? null;
    const callerName = squareCustomer.givenName ?? null;

    if (!squareCustomerId) {
      return anonymousResponse();
    }

    // Step 2 — look up recent orders (requires customer ID from step 1)
    // Note: sequential rather than parallel because orders search requires the
    // customer ID returned by step 1.
    if (!customer.square_location_id) {
      // Can't search orders without a location ID — return name-only context.
      console.log('[pre-call] no square_location_id, skipping orders lookup', { agent_id });
      return json({
        dynamic_variables: {
          caller_name: callerName,
          square_customer_id: squareCustomerId,
          has_recent_order: 'false',
          recent_order_summary: null,
          recent_order_paid: null,
        } satisfies DynamicVariables,
      });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const ordersResult = await squareClient.orders.search({
      locationIds: [customer.square_location_id],
      query: {
        filter: {
          customerFilter: { customerIds: [squareCustomerId] },
          stateFilter: { states: ['OPEN', 'COMPLETED'] },
          dateTimeFilter: { createdAt: { startAt: thirtyDaysAgo.toISOString() } },
        },
        sort: { sortField: 'CREATED_AT', sortOrder: 'DESC' },
      },
      limit: 5,
    });

    const orders = ordersResult.orders ?? [];
    const latencyMs = Date.now() - tSquare;

    console.log('[pre-call] Square lookup complete', {
      squareCustomerId,
      orderCount: orders.length,
      latency_ms: latencyMs,
    });

    if (orders.length === 0) {
      return json({
        dynamic_variables: {
          caller_name: callerName,
          square_customer_id: squareCustomerId,
          has_recent_order: 'false',
          recent_order_summary: null,
          recent_order_paid: null,
        } satisfies DynamicVariables,
      });
    }

    const mostRecent = orders[0];
    const isPaid =
      mostRecent.state === 'COMPLETED' && (mostRecent.tenders?.length ?? 0) > 0;

    // Build a brief summary from fulfillment notes or line item names
    const fulfillment = mostRecent.fulfillments?.[0];
    let orderSummary: string | null = null;
    if (fulfillment?.pickupDetails?.note) {
      orderSummary = fulfillment.pickupDetails.note;
    } else if (fulfillment?.deliveryDetails?.note) {
      orderSummary = fulfillment.deliveryDetails.note;
    } else if (mostRecent.lineItems?.[0]?.name) {
      orderSummary = mostRecent.lineItems[0].name;
    }
    if (orderSummary && !isPaid) orderSummary += ', unpaid';

    return json({
      dynamic_variables: {
        caller_name: callerName,
        square_customer_id: squareCustomerId,
        has_recent_order: 'true',
        recent_order_summary: orderSummary,
        recent_order_paid: isPaid ? 'true' : 'false',
      } satisfies DynamicVariables,
    });
  } catch (err) {
    console.error('[pre-call] Square API error, falling back to anonymous defaults', {
      error: err instanceof Error ? err.message : String(err),
      total_latency_ms: Date.now() - t0,
    });
    return anonymousResponse();
  }
}
