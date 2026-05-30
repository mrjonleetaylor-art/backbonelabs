import { createClient } from '@supabase/supabase-js';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';

// --- Auth (same pattern as order-status) ---

function checkAuth(req: Request): boolean {
  const expectedToken = process.env.ELEVENLABS_TOOL_SECRET;
  if (!expectedToken) return false;
  const authHeader = req.headers.get('authorization') ?? '';
  // Accept either "Bearer <token>" or "<token>" alone — ElevenLabs sends
  // the workspace secret value verbatim and we can't assume Jon prefixed it.
  const candidates = [`Bearer ${expectedToken}`, expectedToken];
  for (const expected of candidates) {
    if (authHeader.length !== expected.length) continue;
    try {
      if (crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))) {
        return true;
      }
    } catch {
      // ignore
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

type CatalogMatch = {
  name: string;
  description: string | null;
  price: string;
  kind: 'item' | 'delivery' | 'other';
  in_stock: boolean;
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

function formatPrice(amount: bigint | null | undefined, currency: string | null | undefined): string {
  if (amount == null) return 'price on request';
  const n = Number(amount) / 100;
  if (n === 0) return 'free';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency ?? 'AUD',
  }).format(n);
}

function classify(name: string): 'item' | 'delivery' | 'other' {
  const lower = name.toLowerCase();
  if (lower.startsWith('delivery')) return 'delivery';
  return 'item';
}

function buildSummary(matches: CatalogMatch[], query: string): string {
  if (matches.length === 0) {
    return `I couldn't find anything matching "${query}" in our list. Stock changes daily, though — the team can confirm if you'd like to leave a name and number.`;
  }
  if (matches.length === 1) {
    const m = matches[0];
    if (m.kind === 'delivery') {
      return `${m.name.replace('Delivery — ', 'Delivery to ')}: ${m.price}.`;
    }
    return `${m.name}: ${m.price}.`;
  }
  // Multiple matches
  const lines = matches.slice(0, 5).map((m) => {
    if (m.kind === 'delivery') {
      return `${m.name.replace('Delivery — ', '')} ${m.price}`;
    }
    return `${m.name} ${m.price}`;
  });
  return `A few options matching "${query}": ${lines.join('; ')}.`;
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

  let body: { agent_id?: string; query?: string };
  try {
    body = await req.json();
  } catch {
    return json(FALLBACK);
  }

  const { agent_id, query } = body;

  if (!query || query.trim().length < 2) {
    return json({
      found: false,
      summary: "I didn't catch what you were after — could you tell me again?",
    });
  }

  if (!agent_id) {
    return json(FALLBACK);
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

  if (error || !customer?.square_access_token) {
    console.error('[check-item] customer lookup failed or missing Square credentials', {
      agent_id,
      error: error?.message,
    });
    return json(FALLBACK);
  }

  const squareClient = makeSquareClient(customer.square_access_token);

  // Browse mode: "what do you have?", "what's available?", "show me your range".
  // These aren't a specific item — list the whole catalog (items only, no
  // delivery zones) so the agent can read back the range.
  const q = query.trim().toLowerCase();
  const BROWSE_TRIGGERS = [
    'what do you have', 'what have you got', "what's available", 'what is available',
    'whats available', 'what can i get', 'your range', 'full range', 'everything',
    'all your', 'what flowers', 'list', 'options', 'selection', 'menu',
  ];
  const isBrowse = BROWSE_TRIGGERS.some((t) => q.includes(t));

  try {
    // Search catalog items by text — Square handles fuzzy matching internally.
    // Browse mode passes no textFilter, returning the whole catalog.
    const result = await squareClient.catalog.searchItems(
      isBrowse ? { limit: 50 } : { textFilter: query.trim(), limit: 10 }
    );

    // CatalogObject is a discriminated union — narrow to ITEM before reading itemData
    const rawItems = (result.items ?? []).filter(
      (it): it is Extract<typeof it, { type: 'ITEM' }> => it.type === 'ITEM'
    );

    if (rawItems.length === 0) {
      return json({
        found: false,
        summary: buildSummary([], query),
      });
    }

    const matches: CatalogMatch[] = rawItems
      .map((it) => {
        const name = it.itemData?.name ?? 'Unknown';
        const description = it.itemData?.description ?? null;
        const variation = it.itemData?.variations?.[0];
        const priceMoney =
          variation?.type === 'ITEM_VARIATION'
            ? variation.itemVariationData?.priceMoney
            : undefined;
        const price = formatPrice(priceMoney?.amount, priceMoney?.currency);
        const kind = classify(name);
        return { name, description, price, kind, in_stock: true };
      })
      // Filter out items with no variations / no price unless query specifically matches
      .filter((m) => m.price !== 'price on request' || m.name.toLowerCase().includes(query.toLowerCase()))
      // In browse mode, drop delivery zones — the caller wants products, not postage.
      .filter((m) => (isBrowse ? m.kind !== 'delivery' : true));

    if (matches.length === 0) {
      return json({
        found: false,
        summary: buildSummary([], query),
      });
    }

    if (isBrowse) {
      const list = matches.map((m) => `${m.name} at ${m.price}`);
      const joined =
        list.length === 1
          ? list[0]
          : list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1];
      return json({
        found: true,
        matches,
        browse: true,
        summary: `Here's what we've got at the moment: ${joined}. Anything there take your fancy, or is it for a particular occasion?`,
      });
    }

    return json({
      found: true,
      matches,
      summary: buildSummary(matches, query),
    });
  } catch (err) {
    console.error('[check-item] Square Catalog API error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return json(FALLBACK);
  }
}
