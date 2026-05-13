'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const supabase = createClient()
    const origin = window.location.origin
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`,
      },
    })

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <h2 className="text-[16px] font-semibold text-slate-900 mb-2">Check your email</h2>
        <p className="text-[14px] text-slate-500 leading-relaxed">
          We sent a sign-in link to <strong>{email}</strong>. Click it to open your dashboard.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-5 text-[13px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
      <label className="block text-[13px] font-medium text-slate-700 mb-1.5" htmlFor="email">
        Email address
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@yourbusiness.com.au"
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
      />
      {status === 'error' && (
        <p className="mt-2 text-[12px] text-red-500">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-[14px] font-semibold rounded-lg py-2.5 transition-colors"
      >
        {status === 'loading' ? 'Sending…' : 'Send sign-in link'}
      </button>
      <p className="mt-4 text-center text-[12px] text-slate-400">
        We&apos;ll email you a one-time link. No password needed.
      </p>
    </form>
  )
}
