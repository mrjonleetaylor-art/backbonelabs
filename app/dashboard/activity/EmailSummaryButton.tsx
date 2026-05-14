'use client'
import { useState, useTransition } from 'react'
import { emailCallSummary } from './actions'

export default function EmailSummaryButton({ callId }: { callId: string }) {
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await emailCallSummary(callId)
      if (result.ok) {
        setStatus('sent')
      } else {
        setStatus('error')
        setErrorMsg(result.error ?? 'Something went wrong.')
      }
    })
  }

  if (status === 'sent') {
    return (
      <div className="w-full text-center text-[12px] text-emerald-600 font-medium py-2.5">
        Sent to your email.
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="w-full text-[13px] font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 rounded-lg py-2.5 transition-colors"
      >
        {isPending ? 'Sending…' : 'Email me this summary'}
      </button>
      {status === 'error' && (
        <p className="text-[11px] text-red-500 text-center mt-1">{errorMsg}</p>
      )}
    </>
  )
}
