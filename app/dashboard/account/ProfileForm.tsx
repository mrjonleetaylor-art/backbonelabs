'use client'
import { useState, useRef } from 'react'
import { saveProfile } from './actions'

type Customer = { owner_name: string | null; owner_email: string; owner_phone: string | null }

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function AutoSaveField({
  label,
  field,
  defaultValue,
  hint,
  readOnly,
}: {
  label: string
  field?: 'owner_name' | 'owner_phone'
  defaultValue: string
  hint?: React.ReactNode
  readOnly?: boolean
}) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [fadeOut, setFadeOut] = useState(false)
  const savedValue = useRef(defaultValue)
  const fadeTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  async function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value === savedValue.current || !field) return
    fadeTimers.current.forEach(clearTimeout)
    setStatus('saving')
    setFadeOut(false)
    const result = await saveProfile(field, value)
    if (result.ok) {
      savedValue.current = value
      setStatus('saved')
      setFadeOut(false)
      const t1 = setTimeout(() => setFadeOut(true), 2000)
      const t2 = setTimeout(() => { setStatus('idle'); setFadeOut(false) }, 2600)
      fadeTimers.current = [t1, t2]
    } else {
      setStatus('error')
      setErrorMsg(result.error ?? "Couldn't save.")
    }
  }

  const hasStatus = status !== 'idle'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-slate-700">{label}</label>
        <span
          className={`flex items-center gap-1 text-[11px] font-medium transition-opacity duration-500 ${
            hasStatus ? (fadeOut ? 'opacity-0' : 'opacity-100') : 'opacity-0'
          } ${
            status === 'saved' ? 'text-indigo-500' :
            status === 'saving' ? 'text-slate-400' :
            'text-red-500'
          }`}
        >
          {status === 'saved' && <CheckIcon />}
          {status === 'saved' ? 'Saved' : status === 'saving' ? 'Saving…' : errorMsg}
        </span>
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
