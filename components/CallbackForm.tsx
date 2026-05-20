"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

type FormState = {
  name: string
  business: string
  phone: string
  best_time: string
  issue: string
}

const defaultForm: FormState = {
  name: "",
  business: "",
  phone: "",
  best_time: "",
  issue: "missed_calls",
}

export default function CallbackForm({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [form, setForm] = useState<FormState>(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const handleClose = useCallback(() => {
    onClose()
    setSubmitted(false)
    setError(null)
    setForm(defaultForm)
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => firstFieldRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isOpen, handleClose])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/callback-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Request failed")
      setSubmitted(true)
    } catch {
      setError("Something went wrong. Please call us directly on 02 5302 3030.")
    } finally {
      setSubmitting(false)
    }
  }, [form])

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] transition-colors"
  const labelClass = "block text-[12px] font-semibold text-slate-700 mb-1.5"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cb-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200]"
            onClick={handleClose}
            aria-hidden="true"
          />

          <motion.div
            key="cb-modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.28, ease }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-[480px] z-[201]"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="callback-form-title"
              className="bg-white rounded-2xl p-7 relative"
              style={{ boxShadow: "0 8px 32px rgba(15,23,42,0.16), 0 2px 8px rgba(15,23,42,0.08)" }}
            >
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <CloseIcon />
              </button>

              {submitted ? (
                <div className="py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#EEF2F8] flex items-center justify-center mx-auto mb-4">
                    <CheckIcon />
                  </div>
                  <h3 className="text-[18px] font-bold text-slate-900 mb-2">Callback requested</h3>
                  <p className="text-[14px] text-slate-500 leading-[1.65]">
                    We&apos;ll call you within one business day.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 bg-[#1E3A5F] hover:bg-[#162D47] text-white text-[14px] font-semibold rounded-full px-7 py-3 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <h3 id="callback-form-title" className="text-[18px] font-bold text-slate-900 mb-1">
                    Request a callback
                  </h3>
                  <p className="text-[13px] text-slate-500 mb-6 leading-[1.55]">
                    We&apos;ll call you within one business day.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="cb-name" className={labelClass}>Your name</label>
                      <input
                        ref={firstFieldRef}
                        id="cb-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputClass}
                        placeholder="Jane Smith"
                      />
                    </div>

                    <div>
                      <label htmlFor="cb-business" className={labelClass}>Business name</label>
                      <input
                        id="cb-business"
                        type="text"
                        required
                        value={form.business}
                        onChange={(e) => setForm({ ...form, business: e.target.value })}
                        className={inputClass}
                        placeholder="Bloom Flowers"
                      />
                    </div>

                    <div>
                      <label htmlFor="cb-phone" className={labelClass}>Phone number</label>
                      <input
                        id="cb-phone"
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={inputClass}
                        placeholder="04XX XXX XXX"
                      />
                    </div>

                    <div>
                      <label htmlFor="cb-best-time" className={labelClass}>Best time to call</label>
                      <input
                        id="cb-best-time"
                        type="text"
                        value={form.best_time}
                        onChange={(e) => setForm({ ...form, best_time: e.target.value })}
                        className={inputClass}
                        placeholder="Morning, after 2pm, anytime..."
                      />
                    </div>

                    <div>
                      <label htmlFor="cb-issue" className={labelClass}>
                        What&apos;s the main problem you&apos;re trying to solve?
                      </label>
                      <select
                        id="cb-issue"
                        value={form.issue}
                        onChange={(e) => setForm({ ...form, issue: e.target.value })}
                        className={inputClass}
                      >
                        <option value="missed_calls">Missing calls when busy</option>
                        <option value="after_hours">No coverage after hours</option>
                        <option value="pricing">Just checking pricing</option>
                        <option value="other">Something else</option>
                      </select>
                    </div>

                    {error && (
                      <p className="text-[13px] text-red-600">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#1E3A5F] hover:bg-[#162D47] disabled:opacity-60 text-white text-[14px] font-semibold rounded-full py-3.5 transition-colors"
                    >
                      {submitting ? "Sending..." : "Request callback"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
