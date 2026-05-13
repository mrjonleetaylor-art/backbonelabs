'use client'
import { useState } from 'react'
import { saveProfile } from './actions'

type Customer = { owner_name: string | null; owner_email: string; owner_phone: string | null }

function AutoSaveField({
  label,
  field,
  defaultValue,
  hint,
  readOnly,
}: {
  label: string
  field: 'owner_name' | 'owner_phone'
  defaultValue: string
  hint?: React.ReactNode
  readOnly?: boolean
}) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value === defaultValue) return
    setStatus('saving')
    const result = await saveProfile(field, value)
    if (result.ok) {
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } else {
      setStatus('error')
      setError(result.error ?? 'Failed to save.')
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-slate-700">{label}</label>
        {status === 'saved' && <span className="text-[11px] text-emerald-600 font-medium">Saved</span>}
        {status === 'saving' && <span className="text-[11px] text-slate-400">Saving…</span>}
        {status === 'error' && <span className="text-[11px] text-red-500">{error}</span>}
      </div>
      <input
        type="text"
        defaultValue={defaultValue}
        onBlur={readOnly ? undefined : handleBlur}
        readOnly={readOnly}
        className={`w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition ${readOnly ? 'bg-slate-50 text-slate-500 cursor-default' : ''}`}
      />
      {hint && <p className="text-[11px] text-slate-400 leading-relaxed">{hint}</p>}
    </div>
  )
}

export default function ProfileForm({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-5">
      <AutoSaveField
        label="Full name"
        field="owner_name"
        defaultValue={customer.owner_name ?? ''}
      />
      <AutoSaveField
        label="Email"
        field="owner_name"
        defaultValue={customer.owner_email}
        readOnly
        hint={
          <>
            To change your email,{' '}
            <a
              href="mailto:support@relaydesk.com.au?subject=Change%20my%20email"
              className="text-indigo-500 hover:underline"
            >
              email support
            </a>
            .
          </>
        }
      />
      <AutoSaveField
        label="Mobile for call transfers"
        field="owner_phone"
        defaultValue={customer.owner_phone ?? ''}
        hint="Tom transfers urgent calls here."
      />
    </div>
  )
}
