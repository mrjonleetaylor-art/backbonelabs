// app/api/twilio-voicemail/route.ts
// Twilio fallback recording-completed webhook.
// Called by a TwiML Bin when ElevenLabs is unreachable. Twilio retries on
// non-2xx for up to 24h — always return 200; dedupe on RecordingSid.

import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { Resend } from 'resend';

type Customer = {
  id: string;
  business_name: string;
  owner_email: string | null;
};

function ok() {
  return new Response('OK', { status: 200 });
}

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function POST(req: Request) {
  // Validate Twilio signature before touching anything.
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    console.error('twilio-voicemail: TWILIO_AUTH_TOKEN not set');
    return new Response('misconfigured', { status: 500 });
  }

  const rawBody = await req.text();

  // Reconstruct the exact URL Twilio signed against.
  const url = new URL(req.url);
  // Vercel forwards under https; ensure scheme is correct.
  url.protocol = 'https:';
  url.host = 'www.relaydesk.com.au';
  const fullUrl = url.toString();

  const sig = req.headers.get('x-twilio-signature') ?? '';
  const params = Object.fromEntries(new URLSearchParams(rawBody));

  const valid = twilio.validateRequest(authToken, sig, fullUrl, params);
  if (!valid) {
    console.warn('twilio-voicemail: invalid signature', { url: fullUrl });
    return new Response('Forbidden', { status: 403 });
  }

  const from          = params['From'] ?? null;
  const to            = params['To'] ?? null;
  const recordingSid  = params['RecordingSid'] ?? null;
  const recordingUrl  = params['RecordingUrl'] ?? null;
  const duration      = params['RecordingDuration'] ? parseInt(params['RecordingDuration'], 10) : null;

  if (!recordingSid) {
    // No RecordingSid means this isn't a recording callback — ignore silently.
    return ok();
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const jonEmail = process.env.JON_EMAIL!;

  // Resolve customer by the number Twilio dialled (To).
  let customer: Customer | null = null;
  if (to) {
    const { data } = await supabase
      .from('customers')
      .select('id, business_name, owner_email')
      .eq('twilio_number', to)
      .maybeSingle<Customer>();
    customer = data ?? null;
  }

  // Insert — ON CONFLICT DO NOTHING dedupes Twilio retries.
  const { data: inserted, error: insertError } = await supabase
    .from('voicemails')
    .insert({
      twilio_to_number:     to,
      twilio_from_number:   from,
      twilio_recording_sid: recordingSid,
      recording_url:        recordingUrl,
      duration_seconds:     Number.isFinite(duration) ? duration : null,
      customer_id:          customer?.id ?? null,
    })
    .select('id')
    .single();

  if (insertError) {
    // Unique violation = already handled (Twilio retry). Return 200.
    if (insertError.code === '23505') {
      return ok();
    }
    console.error('twilio-voicemail: insert error', insertError);
    // Return 200 anyway — we don't want Twilio to retry forever on a DB error.
    return ok();
  }

  const voicemailId = inserted?.id ?? null;

  // Send notification email.
  const toEmail = customer?.owner_email ?? jonEmail;
  const ccEmail = toEmail !== jonEmail ? jonEmail : null;
  const businessLabel = customer?.business_name ?? 'RelayDesk sales';
  const subject = `Voicemail from ${from ?? 'unknown'} — ${businessLabel}`;
  const timestamp = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#222;max-width:600px;">
      <h2 style="margin:0 0 12px;font-size:16px;">${esc(subject)}</h2>
      <p style="margin:4px 0;"><strong>Caller:</strong> ${esc(from ?? 'withheld')}</p>
      <p style="margin:4px 0;"><strong>Called number:</strong> ${esc(to ?? 'unknown')}</p>
      ${customer ? `<p style="margin:4px 0;"><strong>Business:</strong> ${esc(customer.business_name)}</p>` : ''}
      <p style="margin:4px 0;"><strong>Duration:</strong> ${Number.isFinite(duration) ? `${duration}s` : 'unknown'}</p>
      <p style="margin:4px 0;"><strong>Time:</strong> ${esc(timestamp)} AEST</p>
      <p style="margin:16px 0 4px;">
        <a href="${esc(recordingUrl ?? '')}" style="background:#6366F1;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:600;">
          Listen to voicemail
        </a>
      </p>
      <p style="margin-top:24px;font-size:12px;color:#888;">RelayDesk &middot; Fallback voicemail</p>
    </div>
  `;

  let notifiedEmail: string | null = null;
  try {
    await resend.emails.send({
      from: 'RelayDesk <hello@relaydesk.com.au>',
      to: toEmail,
      ...(ccEmail ? { cc: ccEmail } : {}),
      subject,
      html,
    });
    notifiedEmail = toEmail;
  } catch (err) {
    console.error('twilio-voicemail: resend error', err);
  }

  if (voicemailId && notifiedEmail) {
    await supabase
      .from('voicemails')
      .update({ notified_email: notifiedEmail, notified_at: new Date().toISOString() })
      .eq('id', voicemailId);
  }

  return ok();
}
