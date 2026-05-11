// app/api/callback-request/route.ts
// Public endpoint hit by the hero callback form.
// Upserts lead to Supabase and fires email notification to Jon.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

type CallbackRequest = {
  name?: string;
  business?: string;
  phone?: string;
  best_time?: string;
  issue?: string;
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  let body: CallbackRequest;
  try {
    body = (await req.json()) as CallbackRequest;
  } catch {
    return jsonResponse({ error: 'invalid json' }, 400);
  }

  const { name, business, phone, best_time, issue } = body ?? {};

  if (!name || !business || !phone) {
    return jsonResponse({
      error: 'missing required fields',
      required: ['name', 'business', 'phone'],
    }, 400);
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY!);

  // Upsert lead by phone. Don't block the response on failure.
  const { error: leadError } = await supabase
    .from('leads')
    .upsert({
      name,
      business,
      phone,
      what_theyre_solving: issue ?? null,
    }, { onConflict: 'phone', ignoreDuplicates: false });

  if (leadError) {
    console.error('callback_request: lead upsert error', leadError);
  }

  try {
    await resend.emails.send({
      from: 'RelayDesk <hello@relaydesk.com.au>',
      to: process.env.JON_EMAIL!,
      subject: `Callback requested: ${name} from ${business}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.5; color: #222;">
          <h2 style="margin: 0 0 12px 0; font-size: 16px;">Callback request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Business:</strong> ${business}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Best time:</strong> ${best_time ?? 'not specified'}</p>
          <p><strong>Issue:</strong> ${issue ?? 'not specified'}</p>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error('callback_request: email send error', emailErr);
  }

  return jsonResponse({ ok: true }, 200);
}
