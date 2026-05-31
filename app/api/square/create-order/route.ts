import { createClient } from '@supabase/supabase-js';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';

// --- Auth (same Bearer-or-bare pattern as the other tool endpoints) ---

function checkAuth(req: Request): boolean {
  const expectedToken = process.env.ELEVENLABS_TOOL_SECRET;
  if (!expectedToken) return false;
  const authHeader = req.headers.get('authorization') ?? '';
  const candidates = [`Bearer ${expectedToken}`, expectedToken];
  for (const expected of candidates) {
    if (authHeader.length !== expected.length) continue;
    try {
      if (crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))) {
        return true;
      }
    } catch {
      // ignore length mismatch
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

type ResolvedLine = {
  name: string;
  quantity: number;
  catalogObjectId?: string;
  price: string;
  matched: boolean;
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
  order_id: null,
  summary:
    "I couldn't get that order into the system just now — I'll take the details and the team will follow up to confirm.",
};

function formatPrice(amount: bigint | null | undefined, currency: string | null | undefined): string {
  if (amount == null) return 'price on request';
  const n = Number(amount) / 100;
  if (n === 0) return 'free';
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: currency ?? 'AUD' }).format(n);
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

// Parse "2x Mixed bouquet" / "2 Mixed bouquet" / "Mixed bouquet" into {qty, term}.
function parseItemChunk(chunk: string): { qty: number; term: string } {
  const trimmed = chunk.trim();
  const m = trimmed.match(/^(\d+)\s*x?\s+(.*)$/i);
  if (m) {
    const qty = parseInt(m[1], 10);
    return { qty: qty > 0 ? qty : 1, term: m[2].trim() };
  }
  return { qty: 1, term: trimmed };
}

// Best-effort conversion of a caller's date phrase to an RFC3339 timestamp for
// Square's required fulfillment field. The phrase itself is ALSO stored verbatim
// in the fulfillment note — this timestamp is a placeholder the team finalises in
// POS, never read back to the caller. Sally still says the caller's phrase aloud.
function whenTextToIso(whenText: string | undefined): string {
  const fallback = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(10, 0, 0, 0);
    return d.toISOString();
  };
  if (!whenText) return fallback();
  const t = whenText.toLowerCase();
  const now = new Date();
  const at10 = (d: Date) => {
    d.setHours(10, 0, 0, 0);
    return d.toISOString();
  };
  if (t.includes('today')) return at10(new Date());
  if (t.includes('tomorrow')) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return at10(d);
  }
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const idx = days.findIndex((d) => t.includes(d));
  if (idx >= 0) {
    const d = new Date();
    let delta = (idx - d.getDay() + 7) % 7;
    if (delta === 0) delta = 7; // a named weekday means the next one, not today
    d.setDate(d.getDate() + delta);
    return at10(d);
  }
  return fallback();
}

// --- Entry point ---

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return json({ error: 'unauthorized' }, 401);
  }

  let body: {
    agent_id?: string;
    square_customer_id?: string | null;
    items?: string;
    fulfillment_type?: string;
    when_text?: string;
    address?: string;
    recipient_name?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json(FALLBACK);
  }

  const { agent_id, items, fulfillment_type, when_text, address, recipient_name } = body;

  if (!agent_id || !items || !items.trim()) {
    return json(FALLBACK);
  }

  // Guard against a hallucinated customer id. Real Square customer IDs are
  // ~26-char uppercase alphanumerics. The agent has been seen inventing values
  // like "sarah_square_id" — reject anything that isn't ID-shaped so we don't
  // attach an order to a non-existent customer.
  const rawCustomerId = body.square_customer_id?.trim();
  const square_customer_id =
    rawCustomerId && /^[A-Z0-9]{20,}$/.test(rawCustomerId) ? rawCustomerId : null;

  const fulfillmentType = (fulfillment_type ?? '').toLowerCase() === 'delivery' ? 'delivery' : 'pickup';

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
    console.error('[create-order] customer lookup failed or missing Square credentials', {
      agent_id,
      error: error?.message,
    });
    return json(FALLBACK);
  }

  const squareClient = makeSquareClient(customer.square_access_token);
  const locationId = customer.square_location_id;

  try {
    // 1. Resolve each comma-separated item against the catalog.
    const chunks = items.split(',').map((c) => c.trim()).filter(Boolean);
    const resolved: ResolvedLine[] = [];
    for (const chunk of chunks) {
      const { qty, term } = parseItemChunk(chunk);
      let line: ResolvedLine = { name: term, quantity: qty, price: 'price on request', matched: false };
      try {
        const search = await squareClient.catalog.searchItems({ textFilter: term, limit: 5 });
        const items = (search.items ?? []).filter(
          (it): it is Extract<typeof it, { type: 'ITEM' }> => it.type === 'ITEM'
        );
        const item =
          items.find((it) => it.itemData?.name?.toLowerCase() === term.toLowerCase().trim())
          ?? items[0];
        const variation = item?.itemData?.variations?.[0];
        const variationId =
          variation?.type === 'ITEM_VARIATION' ? variation.id : undefined;
        const priceMoney =
          variation?.type === 'ITEM_VARIATION' ? variation.itemVariationData?.priceMoney : undefined;
        if (item && variationId) {
          line = {
            name: item.itemData?.name ?? term,
            quantity: qty,
            catalogObjectId: variationId,
            price: formatPrice(priceMoney?.amount, priceMoney?.currency),
            matched: true,
          };
        }
      } catch (e) {
        console.error('[create-order] catalog resolve failed for chunk', { term, e: e instanceof Error ? e.message : String(e) });
      }
      resolved.push(line);
    }

    // 2. Build Square line items. Catalog match -> priced by catalog. No match ->
    //    ad-hoc line item (name only, no price) so the order still captures it.
    // Ad-hoc (non-catalog) line items REQUIRE base_price_money. We don't know the
    // price for an off-menu item, so we send $0 as a placeholder — the team prices
    // it when they confirm the OPEN order in POS.
    const lineItems = resolved.map((r) =>
      r.catalogObjectId
        ? { catalogObjectId: r.catalogObjectId, quantity: String(r.quantity) }
        : {
            name: r.name,
            quantity: String(r.quantity),
            basePriceMoney: { amount: BigInt(0), currency: 'AUD' as const },
          }
    );

    // 1b. Delivery fee as a real line item, looked up from the catalog by suburb.
    //     The fee must come from Square, never from the agent's mouth (it has been
    //     seen inventing fees like "$13 to Sutherland"). If we can't match a zone,
    //     we add NO delivery line and the summary says the team will confirm it.
    let deliveryFee: { name: string; amount: bigint } | null = null;
    if (fulfillmentType === 'delivery' && address?.trim()) {
      // Suburb is best-effort: last alphabetic comma-separated chunk, or last words.
      const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
      const tail = parts[parts.length - 1] ?? '';
      const suburbGuess = tail.replace(/\b\d{4}\b/g, '').replace(/[^a-zA-Z\s]/g, '').trim();
      if (suburbGuess.length >= 3) {
        try {
          const dz = await squareClient.catalog.searchItems({ textFilter: `Delivery ${suburbGuess}`, limit: 10 });
          const zone = (dz.items ?? [])
            .filter((it): it is Extract<typeof it, { type: 'ITEM' }> => it.type === 'ITEM')
            .find((it) => it.itemData?.name?.toLowerCase() === `delivery — ${suburbGuess.toLowerCase()}`);
          const zVar = zone?.itemData?.variations?.[0];
          const zId = zVar?.type === 'ITEM_VARIATION' ? zVar.id : undefined;
          const zPrice = zVar?.type === 'ITEM_VARIATION' ? zVar.itemVariationData?.priceMoney : undefined;
          if (zone && zId) {
            lineItems.push({ catalogObjectId: zId, quantity: '1' });
            deliveryFee = { name: zone.itemData?.name ?? `Delivery — ${suburbGuess}`, amount: zPrice?.amount ?? BigInt(0) };
          }
        } catch (e) {
          console.error('[create-order] delivery zone lookup failed', { suburbGuess, e: e instanceof Error ? e.message : String(e) });
        }
      }
    }

    // 3. Build the single fulfillment. Caller's date phrase goes verbatim in the
    //    note; the timestamp is a team-finalised placeholder.
    const iso = whenTextToIso(when_text);
    const displayName = recipient_name?.trim() || undefined;
    const noteParts = [when_text ? `Requested: ${when_text}` : null].filter(Boolean) as string[];

    let fulfillment;
    if (fulfillmentType === 'delivery') {
      if (address?.trim()) noteParts.push(`Deliver to: ${address.trim()}`);
      fulfillment = {
        type: 'DELIVERY' as const,
        deliveryDetails: {
          recipient: {
            displayName: displayName ?? 'Customer',
            ...(address?.trim()
              ? { address: { addressLine1: address.trim(), country: 'AU' as const } }
              : {}),
          },
          scheduleType: 'SCHEDULED' as const,
          deliverAt: iso,
          note: noteParts.join(' | ') || undefined,
        },
      };
    } else {
      fulfillment = {
        type: 'PICKUP' as const,
        pickupDetails: {
          ...(displayName ? { recipient: { displayName } } : {}),
          scheduleType: 'SCHEDULED' as const,
          pickupAt: iso,
          note: noteParts.join(' | ') || undefined,
        },
      };
    }

    // 4. Deterministic idempotency key over the order signature so an HTTP retry
    //    (or accidental double tool-fire) collapses to one order. A genuine
    //    identical re-order the same day would dedupe — rare for florals, and the
    //    team reviews every OPEN order in POS.
    const idemSeed = JSON.stringify({
      agent_id,
      square_customer_id: square_customer_id ?? null,
      items: resolved.map((r) => `${r.quantity}x${r.name}`),
      fulfillmentType,
      when_text: when_text ?? null,
      address: address ?? null,
    });
    const idempotencyKey = crypto.createHash('sha256').update(idemSeed).digest('hex').slice(0, 45);

    // 5. Create the order. Default state is OPEN (never COMPLETED) — the team
    //    confirms and finalises in Square POS.
    const result = await squareClient.orders.create({
      idempotencyKey,
      order: {
        locationId,
        ...(square_customer_id ? { customerId: square_customer_id } : {}),
        lineItems,
        fulfillments: [fulfillment],
      },
    });

    const order = result.order;
    if (!order?.id) {
      console.error('[create-order] Square returned no order', { agent_id });
      return json(FALLBACK);
    }

    // 6. Build a natural read-back summary for Sally.
    const itemPhrases = resolved.map((r) => {
      const q = r.quantity > 1 ? `${r.quantity} ` : '';
      return `${q}${r.name}`;
    });
    const itemsText =
      itemPhrases.length === 1
        ? itemPhrases[0]
        : itemPhrases.slice(0, -1).join(', ') + ' and ' + itemPhrases[itemPhrases.length - 1];
    const whenPhrase = when_text ? ` for ${when_text}` : '';
    const where =
      fulfillmentType === 'delivery'
        ? address?.trim()
          ? ` for delivery to ${address.trim()}`
          : ' for delivery'
        : ' for pickup';
    // Total comes straight from the created order (includes the delivery line if
    // one was added), so the spoken total always matches what's in Square.
    const total = formatPrice(order.totalMoney?.amount, order.totalMoney?.currency);
    const totalText = total !== 'price on request' && total !== 'free' ? `, total ${total}` : '';

    // Delivery clause: state the looked-up fee, or that the team will confirm it.
    let deliveryText = '';
    if (fulfillmentType === 'delivery') {
      if (deliveryFee) {
        deliveryText = deliveryFee.amount === BigInt(0)
          ? ' Delivery is free to that area.'
          : ` Delivery is ${formatPrice(deliveryFee.amount, 'AUD')}.`;
      } else if (address?.trim()) {
        deliveryText = ' The team will confirm the delivery cost for that address.';
      }
    }

    return json({
      created: true,
      order_id: order.id,
      delivery_fee: deliveryFee ? formatPrice(deliveryFee.amount, 'AUD') : null,
      line_items: resolved.map((r) => ({ name: r.name, quantity: r.quantity, price: r.price, matched: r.matched })),
      summary: `That's ${itemsText}${where}${whenPhrase}${totalText}.${deliveryText} I've put that through for the team to confirm.`,
    });
  } catch (err) {
    console.error('[create-order] Square Orders API error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return json(FALLBACK);
  }
}
