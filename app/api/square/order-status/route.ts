import { createClient } from '@supabase/supabase-js';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';

// --- Auth ---

function checkAuth(req: Request): boolean {
  const expectedToken = process.env.ELEVENLABS_TOOL_SECRET;
  if (!expectedToken) return false;
  const authHeader = req.headers.get('authorization') ?? '';
  // Accept either "Bearer <token>" (canonical) or "<token>" alone.
  // ElevenLabs sends the raw secret value as the header — if Jon stored
  // just the hex in the workspace secret (no Bearer prefix), the
  // bare-token form is what arrives. Tolerate both.
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

type OrderResult = {
  order_id: string | null;
  status: string;
  description: string | null;
  delivery_date: string | null;
  fulfillment_type: 'pickup' | 'delivery' | null;
  amount: string | null;
  paid: boolean;
};

// --- Helpers ---

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const FALLBACK = {
  found: false,
  summary:
    "I couldn't pull that up right now — let me take a message and the florist will follow up.",
};

function formatMoney(amount: bigint | null | undefined, currency: string | null | undefined): string {
  if (amount == null) return 'unknown amount';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency ?? 'AUD',
  }).format(Number(amount) / 100);
}

function buildSummary(orders: OrderResult[]): string {
  if (orders.length === 0) {
    return "I couldn't find any recent orders linked to this number. Would you like to place a new order?";
  }
  const o = orders[0];
  const parts: string[] = [];
  if (o.description) parts.push(o.description);
  if (o.fulfillment_type === 'delivery' && o.delivery_date) {
    parts.push(`for delivery on ${o.delivery_date}`);
  } else if (o.fulfillment_type === 'pickup' && o.delivery_date) {
    parts.push(`for pickup on ${o.delivery_date}`);
  } else if (o.delivery_date) {
    parts.push(`for ${o.delivery_date}`);
  }
  if (o.amount) parts.push(o.amount);
  const desc = parts.join(', ') || 'recent order';
  const statusNote = o.paid ? 'Paid.' : 'Not yet paid.';
  const count = orders.length === 1 ? 'one upcoming order' : `${orders.length} upcoming orders`;
  return `You have ${count}: ${desc}. ${statusNote}`;
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

  let body: { agent_id?: string; square_customer_id?: string; query?: string };
  try {
    body = await req.json();
  } catch {
    return json(FALLBACK);
  }

  const { agent_id, square_customer_id, query } = body;

  if (!square_customer_id) {
    return json({
      found: false,
      summary:
        "I couldn't find any recent orders — the caller's Square profile wasn't identified. Would you like to place a new order?",
    });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: customer, error } = await supabase
    .from('customers')
    .select('id, square_access_token, square_location_id')
    .eq('elevenlabs_agent_id', agent_id)
    .maybeSingle<CustomerRow>();

  if (error || !customer?.square_access_token || !customer.square_location_id) {
    console.error('[order-status] customer lookup failed or missing Square credentials', {
      agent_id,
      error: error?.message,
    });
    return json(FALLBACK);
  }

  const squareClient = makeSquareClient(customer.square_access_token);

  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const result = await squareClient.orders.search({
      locationIds: [customer.square_location_id],
      query: {
        filter: {
          customerFilter: { customerIds: [square_customer_id] },
          stateFilter: { states: ['OPEN', 'COMPLETED'] },
          dateTimeFilter: { createdAt: { startAt: ninetyDaysAgo.toISOString() } },
        },
        sort: { sortField: 'CREATED_AT', sortOrder: 'DESC' },
      },
      limit: 5,
    });

    const rawOrders = result.orders ?? [];

    if (rawOrders.length === 0) {
      return json({
        found: false,
        summary:
          "I couldn't find any recent orders linked to this number. Would you like to place a new order?",
      });
    }

    const orders: OrderResult[] = rawOrders.map((o) => {
      const fulfillment = o.fulfillments?.[0];
      const pickupAt = fulfillment?.pickupDetails?.pickupAt;
      const deliverAt = fulfillment?.deliveryDetails?.deliverAt;
      const whenIso = pickupAt ?? deliverAt;
      const deliveryDate = whenIso
        ? new Date(whenIso).toLocaleDateString('en-AU', { weekday: 'long' })
        : null;
      const fulfillmentType: 'pickup' | 'delivery' | null = pickupAt
        ? 'pickup'
        : deliverAt
          ? 'delivery'
          : null;
      const description = o.lineItems?.[0]?.name ?? null;
      const amount = formatMoney(o.totalMoney?.amount, o.totalMoney?.currency);
      const isPaid = o.state === 'COMPLETED' && (o.tenders?.length ?? 0) > 0;

      return {
        order_id: o.id ?? null,
        status: isPaid ? 'confirmed' : 'pending',
        description,
        delivery_date: deliveryDate,
        fulfillment_type: fulfillmentType,
        amount,
        paid: isPaid,
      };
    });

    // Apply keyword filter if provided, fall back to all orders if nothing matches
    const filtered = query
      ? orders.filter(
          (o) =>
            o.description?.toLowerCase().includes(query.toLowerCase()) ||
            o.delivery_date?.toLowerCase().includes(query.toLowerCase())
        )
      : orders;

    const displayOrders = filtered.length > 0 ? filtered : orders;

    return json({
      found: true,
      orders: displayOrders,
      summary: buildSummary(displayOrders),
    });
  } catch (err) {
    console.error('[order-status] Square API error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return json(FALLBACK);
  }
}
