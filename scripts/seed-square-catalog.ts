/**
 * Seed Square sandbox catalog with florist items + delivery zones.
 * Idempotent: searches by name before creating; skips if already present.
 * Run: npm run seed:square:catalog
 */

import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';

loadEnvConfig(process.cwd());

// --- Credentials (same pattern as seed-square-sandbox.ts) ---

async function resolveSquareCredentials(): Promise<{ token: string; locationId: string }> {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('customers')
      .select('square_access_token, square_location_id')
      .eq('id', 'ccf28ad5-68c1-4b9a-9629-b3f9b0e2ccef')
      .maybeSingle();

    if (error) {
      console.error('Supabase lookup failed:', error.message);
    } else if (data?.square_access_token && data?.square_location_id) {
      return { token: data.square_access_token, locationId: data.square_location_id };
    } else {
      console.error('Sally sandbox row missing square_access_token or square_location_id.');
      process.exit(1);
    }
  }

  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (token && locationId) return { token, locationId };

  console.error('Cannot resolve Square credentials.');
  process.exit(1);
}

// --- Catalog fixtures ---

type CatalogFixture = {
  name: string;
  description: string;
  priceCents: number;
  kind: 'item' | 'delivery';
};

const FIXTURES: CatalogFixture[] = [
  // Florist items
  { name: 'Mixed bouquet', description: 'Seasonal mixed bouquet, florist choice', priceCents: 8500, kind: 'item' },
  { name: 'Single bouquet', description: 'A simple hand-tied bouquet', priceCents: 6000, kind: 'item' },
  { name: 'Red roses arrangement', description: 'Classic red roses in a vase', priceCents: 12000, kind: 'item' },
  { name: 'Sunflowers', description: 'Bright sunflower bunch', priceCents: 7500, kind: 'item' },
  { name: 'Lilies', description: 'White lily arrangement', priceCents: 9000, kind: 'item' },
  { name: 'Tulips', description: 'Mixed tulip bunch', priceCents: 6500, kind: 'item' },
  // Delivery zones (as service-type items)
  { name: 'Delivery — Bangor', description: 'Local delivery, Bangor', priceCents: 0, kind: 'delivery' },
  { name: 'Delivery — Menai', description: 'Local delivery, Menai', priceCents: 1000, kind: 'delivery' },
  { name: 'Delivery — Cronulla', description: 'Beach-side delivery, Cronulla', priceCents: 1500, kind: 'delivery' },
  { name: 'Delivery — Bundeena', description: 'Royal National Park region, Bundeena', priceCents: 2500, kind: 'delivery' },
];

// --- Seed logic ---

async function findExistingItem(client: SquareClient, name: string) {
  const result = await client.catalog.searchItems({
    textFilter: name,
    limit: 5,
  });
  const items = (result.items ?? []).filter(
    (it): it is Extract<typeof it, { type: 'ITEM' }> => it.type === 'ITEM'
  );
  return items.find(
    (i) => i.itemData?.name?.toLowerCase() === name.toLowerCase()
  );
}

async function upsertFixture(
  client: SquareClient,
  fixture: CatalogFixture
): Promise<{ status: 'created' | 'reused'; itemId: string; variationId: string }> {
  const existing = await findExistingItem(client, fixture.name);
  if (existing?.id) {
    const variationId = existing.itemData?.variations?.[0]?.id;
    if (!variationId) throw new Error(`Existing item ${fixture.name} has no variation`);
    return { status: 'reused', itemId: existing.id, variationId };
  }

  const itemTempId = `#item_${fixture.name.replace(/\W+/g, '_').toLowerCase()}`;
  const variationTempId = `${itemTempId}_var`;

  const result = await client.catalog.object.upsert({
    idempotencyKey: crypto.randomUUID(),
    object: {
      type: 'ITEM',
      id: itemTempId,
      itemData: {
        name: fixture.name,
        description: fixture.description,
        productType: 'REGULAR',
        variations: [
          {
            type: 'ITEM_VARIATION',
            id: variationTempId,
            itemVariationData: {
              name: 'Regular',
              pricingType: 'FIXED_PRICING',
              priceMoney: {
                amount: BigInt(fixture.priceCents),
                currency: 'AUD',
              },
            },
          },
        ],
      },
    },
  });

  const created = result.catalogObject;
  if (!created?.id) throw new Error(`Upsert returned no id for ${fixture.name}`);
  // We just upserted an ITEM, so narrow before reading itemData.
  const variationId =
    created.type === 'ITEM' ? (created.itemData?.variations?.[0]?.id ?? '') : '';
  return { status: 'created', itemId: created.id, variationId };
}

async function main() {
  const { token } = await resolveSquareCredentials();

  const client = new SquareClient({
    token,
    environment: SquareEnvironment.Sandbox,
  });

  console.log(`Seeding ${FIXTURES.length} catalog fixtures...\n`);

  const results: Array<{ name: string; status: string; itemId: string }> = [];
  for (const fixture of FIXTURES) {
    try {
      const r = await upsertFixture(client, fixture);
      const dollars = (fixture.priceCents / 100).toFixed(2);
      console.log(
        `  ${r.status === 'created' ? '+' : '='} ${fixture.name.padEnd(34)} $${dollars.padStart(6)}  [${fixture.kind}]  ${r.itemId}`
      );
      results.push({ name: fixture.name, status: r.status, itemId: r.itemId });
    } catch (err) {
      console.error(`  ! ${fixture.name}: ${err instanceof Error ? err.message : String(err)}`);
      results.push({ name: fixture.name, status: 'error', itemId: '' });
    }
  }

  const created = results.filter((r) => r.status === 'created').length;
  const reused = results.filter((r) => r.status === 'reused').length;
  const errors = results.filter((r) => r.status === 'error').length;

  console.log(`\nDone. Created ${created}, reused ${reused}, errors ${errors}.`);
  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
