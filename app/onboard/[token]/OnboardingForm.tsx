'use client';

import { useState, useCallback, useRef } from 'react';

// Field names that match the onboarding_sessions table columns
type Session = {
  id: string;
  token: string;
  // Stage 1
  business_name: string | null;
  owner_name: string | null;
  industry: string | null;
  owner_email: string | null;
  owner_mobile: string | null;
  existing_phone: string | null;
  new_number_needed: boolean | null;
  // Stage 2
  services: string | null;
  pricing_approach: string | null;
  hours: string | null;
  service_area: string | null;
  top_questions: string | null;
  info_capture: string | null;
  callback_offer: string | null;
  callback_slots: string | null;
  transfer_mobile: string | null;
  summary_email: string | null;
  customer_confirmation: boolean | null;
  additional_notes: string | null;
  // Stage 3
  agent_name: string | null;
  agent_voice: string | null;
  call_handling_preference: string | null;
  escalation_conditions: string | null;
  callback_commitment: string | null;
  call_volume: string | null;
  success_metrics: string | null;
  // Meta
  internal_notes: string | null;
};

type Props = {
  token: string;
  initialData: Session;
  isAdmin: boolean;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function StageBadge({ n, label }: { n: number; label: string }) {
  const colours = [
    'bg-indigo-50 text-indigo-700 border-indigo-200',
    'bg-cyan-50 text-cyan-700 border-cyan-200',
    'bg-violet-50 text-violet-700 border-violet-200',
  ];
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${colours[n - 1] ?? colours[0]}`}>
      <span className="w-4 h-4 rounded-full bg-current opacity-20 flex items-center justify-center text-[10px] font-bold">
        {n}
      </span>
      Stage {n}: {label}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder-slate-300';
const textareaClass = `${inputClass} resize-none`;

export function OnboardingForm({ token, initialData, isAdmin }: Props) {
  const [data, setData] = useState<Session>(initialData);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const patch = useCallback(
    async (fields: Partial<Session>) => {
      setSaveState('saving');
      try {
        const res = await fetch(`/api/onboarding/${token}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fields),
        });
        if (!res.ok) throw new Error('save failed');
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2500);
      } catch {
        setSaveState('error');
        setTimeout(() => setSaveState('idle'), 4000);
      }
    },
    [token]
  );

  // Save on blur (immediate)
  const handleBlur = useCallback(
    (field: keyof Session, value: string | boolean) => {
      const update = { [field]: value === '' ? null : value };
      setData(prev => ({ ...prev, ...update }));
      patch(update);
    },
    [patch]
  );

  // Debounced save on change (300ms)
  const handleChange = useCallback(
    (field: keyof Session, value: string | boolean) => {
      const update = { [field]: value === '' ? null : value };
      setData(prev => ({ ...prev, ...update }));
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => patch(update), 300);
    },
    [patch]
  );

  function textProps(field: keyof Session) {
    return {
      value: (data[field] as string) ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleChange(field, e.target.value),
      onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleBlur(field, e.target.value),
    };
  }

  function checkProps(field: keyof Session) {
    return {
      checked: !!(data[field] as boolean),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleBlur(field, e.target.checked),
    };
  }

  const saveLabel =
    saveState === 'saving'
      ? 'Saving…'
      : saveState === 'saved'
      ? '✓ Saved'
      : saveState === 'error'
      ? '⚠ Save failed'
      : '';

  const saveColour =
    saveState === 'saved'
      ? 'text-emerald-600'
      : saveState === 'error'
      ? 'text-red-500'
      : 'text-slate-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="text-[22px] font-bold tracking-tight mb-1">
              <span className="text-cyan-500">Relay</span><span className="text-slate-900">Desk</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {data.business_name ? `${data.business_name}: Onboarding` : 'Business Onboarding'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Fill in what you can. Everything saves automatically, so come back any time.
            </p>
          </div>
          <div className={`text-xs font-medium transition-opacity ${saveState === 'idle' ? 'opacity-0' : 'opacity-100'} ${saveColour} pt-1 whitespace-nowrap`}>
            {saveLabel}
          </div>
        </div>

        {/* Stage 1 */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="mb-5">
            <StageBadge n={1} label="Business details" />
            <p className="text-xs text-slate-400 mt-2">Filled in by your RelayDesk consultant before this link was sent.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Business name">
              <input type="text" className={inputClass} placeholder="e.g. Mini Marshmallows" {...textProps('business_name')} />
            </Field>
            <Field label="Owner name">
              <input type="text" className={inputClass} {...textProps('owner_name')} />
            </Field>
            <Field label="Industry / vertical">
              <input type="text" className={inputClass} placeholder="e.g. Florist, Party planning" {...textProps('industry')} />
            </Field>
            <Field label="Owner email">
              <input type="email" className={inputClass} {...textProps('owner_email')} />
            </Field>
            <Field label="Owner mobile">
              <input type="tel" className={inputClass} placeholder="04XX XXX XXX" {...textProps('owner_mobile')} />
            </Field>
            <Field label="Existing business phone">
              <input type="tel" className={inputClass} placeholder="02 XXXX XXXX" {...textProps('existing_phone')} />
            </Field>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-indigo-600" {...checkProps('new_number_needed')} />
              <span className="text-sm text-slate-700">New RelayDesk phone number needed?</span>
            </label>
          </div>
        </section>

        {/* Stage 2 */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="mb-5">
            <StageBadge n={2} label="Your business" />
            <p className="text-xs text-slate-400 mt-2">Fill this in before your demo call. The more detail the better.</p>
          </div>

          <div className="space-y-4">
            <Field label="Services you offer" hint="What do you sell or do? List your main service types.">
              <textarea rows={3} className={textareaClass} placeholder="e.g. Fresh flower arrangements, wedding floristry, same-day delivery, funeral wreaths" {...textProps('services')} />
            </Field>
            <Field label="Pricing approach" hint="How do you price your work? Rough ranges are fine.">
              <textarea rows={2} className={textareaClass} placeholder="e.g. Arrangements from $60, weddings quoted individually, delivery $15 flat" {...textProps('pricing_approach')} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Operating hours">
                <input type="text" className={inputClass} placeholder="e.g. Mon–Fri 8am–5pm, Sat 9am–1pm" {...textProps('hours')} />
              </Field>
              <Field label="Service area">
                <input type="text" className={inputClass} placeholder="e.g. Sydney metro, within 30km of CBD" {...textProps('service_area')} />
              </Field>
            </div>
            <Field label="Top 3–5 questions callers ask" hint="What do people most commonly want to know?">
              <textarea rows={3} className={textareaClass} placeholder="e.g. Do you do same-day? Can I customise colours? What's included in a bridal package?" {...textProps('top_questions')} />
            </Field>
            <Field label="What info should the agent capture on each call?" hint="Name? Phone? Service type? Preferred date?">
              <textarea rows={2} className={textareaClass} placeholder="e.g. Caller name, mobile, type of arrangement, occasion, preferred pickup/delivery date" {...textProps('info_capture')} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Should the agent offer callbacks?" hint="Yes / No, or describe conditions (e.g. only for complex requests)">
                <input type="text" className={inputClass} placeholder="Yes / No" {...textProps('callback_offer')} />
              </Field>
              <Field label="Mobile to transfer urgent calls to" hint="Leave blank if you don't want live transfers">
                <input type="tel" className={inputClass} placeholder="04XX XXX XXX" {...textProps('transfer_mobile')} />
              </Field>
            </div>
            <Field label="Available callback time slots" hint="When can you take callbacks?">
              <textarea rows={2} className={textareaClass} placeholder="e.g. Mon–Fri 10am–12pm, Tue & Thu afternoons" {...textProps('callback_slots')} />
            </Field>
            <Field label="Email for call summaries">
              <input type="email" className={inputClass} placeholder="you@yourbusiness.com.au" {...textProps('summary_email')} />
            </Field>
            <div className="mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-indigo-600" {...checkProps('customer_confirmation')} />
                <span className="text-sm text-slate-700">Send callers a confirmation SMS or email after booking?</span>
              </label>
            </div>
            <Field label="Anything else we should know?" hint="Special instructions, seasonal notes, things the agent should never say, etc.">
              <textarea rows={3} className={textareaClass} placeholder="Optional. Anything else that would help the agent represent your business well." {...textProps('additional_notes')} />
            </Field>
          </div>
        </section>

        {/* Stage 3 */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="mb-5">
            <StageBadge n={3} label="Agent setup" />
            <p className="text-xs text-slate-400 mt-2">Completed together during the demo call.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Agent name" hint="What should the agent call itself?">
                <input type="text" className={inputClass} placeholder="e.g. Sophie, Sam, Riley" {...textProps('agent_name')} />
              </Field>
              <Field label="Agent voice" hint="To be chosen together during the demo call.">
                <input type="text" className={inputClass} placeholder="Leave blank for now" {...textProps('agent_voice')} />
              </Field>
            </div>
            <Field label="Call handling preference" hint="How should the agent handle after-hours calls?">
              <textarea rows={2} className={textareaClass} placeholder="e.g. Take a message and offer a callback. Don't quote prices after hours." {...textProps('call_handling_preference')} />
            </Field>
            <Field label="Escalation conditions" hint="When should the agent transfer or flag a call as urgent?">
              <textarea rows={2} className={textareaClass} placeholder="e.g. Complaints, media enquiries, anything to do with the wedding order for 14 June" {...textProps('escalation_conditions')} />
            </Field>
            <Field label="Callback commitment" hint="What does the agent promise callers who are offered a callback?">
              <input type="text" className={inputClass} placeholder="e.g. within 24 hours, same day before 5pm" {...textProps('callback_commitment')} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Expected call volume per week">
                <input type="text" className={inputClass} placeholder="e.g. 10–20 calls" {...textProps('call_volume')} />
              </Field>
              <Field label="How will you measure success?">
                <input type="text" className={inputClass} placeholder="e.g. Bookings captured, calls answered" {...textProps('success_metrics')} />
              </Field>
            </div>
          </div>
        </section>

        {/* Admin-only section */}
        {isAdmin && (
          <section className="bg-amber-50 rounded-xl border border-amber-200 p-6 mb-6">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-3 py-1">
                🔒 Admin only
              </span>
              <p className="text-xs text-amber-600 mt-2">This section is only visible when you open the link with <code className="bg-amber-100 px-1 rounded">?admin=1</code>.</p>
            </div>
            <Field label="Internal notes" hint="Not visible to the customer. Configuration notes, issues, next actions.">
              <textarea rows={4} className={`${textareaClass} bg-amber-50 border-amber-200 focus:ring-amber-400`} placeholder="e.g. Sheena prefers morning callbacks. ElevenLabs agent not yet created, waiting on KB fields." {...textProps('internal_notes')} />
            </Field>
          </section>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pb-8">
          Your answers save automatically.{' '}
          <a href="tel:+61253023030" className="text-indigo-500 hover:underline">02 5302 3030</a>
          {' '}· hello@relaydesk.com.au
        </div>

      </div>
    </div>
  );
}
