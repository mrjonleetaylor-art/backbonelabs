/**
 * Seed Square sandbox with T1–T3 test fixtures.
 * Run: npm run seed:square
 */

import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';

loadEnvConfig(process.cwd());

// --- Credentials ---

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
      console.error('Run the Supabase migration and update the sandbox row first.');
      process.exit(1);
    }
  }

  // Fallback: direct env vars
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (token && locationId) {
    return { token, locationId };
  }

  console.error(
    'Cannot resolve Square credentials. Provide one of:\n' +
      '  A) SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local\n' +
      '  B) SQUARE_ACCESS_TOKEN + SQUARE_LOCATION_ID in .env.local'
  );
  process.exit(1);
}

// --- Square helpers ---

function makeClient(token: string) {
  return new SquareClient({
    token,
    environment: SquareEnvironment.Sandbox,
  });
}

function idempotencyKey() {
  return crypto.randomUUID();
}

function nextWeekday(targetDay: number /* 0=Sun … 6=Sat */): string {
  const d = new Date();
  const today = d.getDay();
  const daysUntil = ((targetDay - today + 7) % 7) || 7;
  d.setDate(d.getDate() + daysUntil);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

// --- Find or create Square customer ---

async function findOrCreateCustomer(
  client: SquareClient,
  opts: { phone: string; email: string; givenName: string; familyName: string }
): Promise<string> {
  const search = await client.customers.search({
    query: { filter: { phoneNumber: { exact: opts.phone } } },
  });

  const existing = search.customers?.[0];
  if (existing?.id) {
    console.log(`  found existing customer ${existing.id} (${opts.givenName} ${opts.familyName})`);
    return existing.id;
  }

  const created = await client.customers.create({
    idempotencyKey: idempotencyKey(),
    givenName: opts.givenName,
    familyName: opts.familyName,
    emailAddress: opts.email,
    phoneNumber: opts.phone,
  });

  const id = created.customer?.id;
  if (!id) throw new Error(`Failed to create customer ${opts.givenName}`);
  console.log(`  created customer ${id} (${opts.givenName} ${opts.familyName})`);
  return id;
}

// --- Seed T1: Sarah Mitchell — open order, unpaid ---

async function seedSarah(client: SquareClient, locationId: string): Promise<void> {
  console.log('\nT1 — Sarah Mitchell');
  const customerId = await findOrCreateCustomer(client, {
    phone: '+61411000001',
    email: 'sarah.mitchell@example.com',
    givenName: 'Sarah',
    familyName: 'Mitchell',
  });

  const nextFriday = nextWeekday(5);
  const order = await client.orders.create({
    idempotencyKey: idempotencyKey(),
    order: {
      locationId,
      customerId,
      lineItems: [
        {
          quantity: '1',
          name: 'Mixed bouquet',
          basePriceMoney: { amount: BigInt(8500), currency: 'AUD' },
        },
      ],
      fulfillments: [
        {
          type: 'PICKUP',
          pickupDetails: {
            pickupAt: nextFriday,
            note: 'Delivery to: 12 Rose Street Bangor',
            recipient: { displayName: 'Sarah Mitchell' },
          },
        },
      ],
    },
  });

  const orderId = order.order?.id;
  if (!orderId) throw new Error('Sarah: order creation failed');
  console.log(`  order ${orderId} — OPEN, $85.00, pickup ${nextFriday.slice(0, 10)}`);
}

// --- Seed T2: Tom Nguyen — order + payment (COMPLETED) ---

async function seedTom(client: SquareClient, locationId: string): Promise<void> {
  console.log('\nT2 — Tom Nguyen');
  const customerId = await findOrCreateCustomer(client, {
    phone: '+61411000002',
    email: 'tom.nguyen@example.com',
    givenName: 'Tom',
    familyName: 'Nguyen',
  });

  const nextSaturday = nextWeekday(6);
  const order = await client.orders.create({
    idempotencyKey: idempotencyKey(),
    order: {
      locationId,
      customerId,
      lineItems: [
        {
          quantity: '1',
          name: 'Arrangement',
          basePriceMoney: { amount: BigInt(12000), currency: 'AUD' },
        },
      ],
      fulfillments: [
        {
          type: 'PICKUP',
          pickupDetails: {
            pickupAt: nextSaturday,
            recipient: { displayName: 'Tom Nguyen' },
          },
        },
      ],
    },
  });

  const orderId = order.order?.id;
  if (!orderId) throw new Error('Tom: order creation failed');
  console.log(`  order ${orderId} — created, $120.00, pickup ${nextSaturday.slice(0, 10)}`);

  const payment = await client.payments.create({
    idempotencyKey: idempotencyKey(),
    sourceId: 'cnon:card-nonce-ok',
    amountMoney: { amount: BigInt(12000), currency: 'AUD' },
    orderId,
    locationId,
  });

  const paymentId = payment.payment?.id;
  const status = payment.payment?.status ?? 'unknown';
  console.log(`  payment ${paymentId} — ${status} → order COMPLETED`);
}

// --- Seed T3: Casey Walsh — customer only, no orders ---

async function seedCasey(client: SquareClient): Promise<void> {
  console.log('\nT3 — Casey Walsh');
  await findOrCreateCustomer(client, {
    phone: '+61411000003',
    email: 'casey.walsh@example.com',
    givenName: 'Casey',
    familyName: 'Walsh',
  });
}

// --- Main ---

async function main() {
  console.log('Resolving Square sandbox credentials...');
  const { token, locationId } = await resolveSquareCredentials();
  console.log(`location: ${locationId}`);

  const client = makeClient(token);

  await seedSarah(client, locationId);
  await seedTom(client, locationId);
  await seedCasey(client);

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('\nSeed failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
