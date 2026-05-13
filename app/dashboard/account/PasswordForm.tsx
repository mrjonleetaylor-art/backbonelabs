'use client'
import { useState, useTransition } from 'react'
import { changePassword } from './actions'

export default function PasswordForm() {
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pw !== confirm) { setStatus('error'); setMsg('Passwords don\'t match.'); return }
    startTransition(async () => {
      const result = await changePassword(pw)
      if (result.ok) {
        setStatus('ok')
        setMsg('Password updated.')
        setPw('')
        setConfirm('')
      } else {
        setStatus('error')
        setMsg(result.error ?? 'Something went wrong.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-slate-700">New password</label>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          minLength={12}
          placeholder="At least 12 characters"
          className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-slate-700">Confirm password</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Repeat new password"
          className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
        />
      </div>
      {status !== 'idle' && (
        <p className={`text-[12px] ${status === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</p>
      )}
      <button
        type="submit"
        disabled={isPending || !pw || !confirm}
        className="text-[13px] font-medium bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg px-5 py-2.5 transition-colors"
      >
        {isPending ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}
