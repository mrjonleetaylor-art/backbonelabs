"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const STORAGE_KEY = "relaydesk_cookie_consent"
const OPEN_EVENT = "relaydesk:open-cookie-banner"
const SAVED_EVENT = "relaydesk:consent-saved"

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof window !== "undefined" ? localStorage.getItem(key) : null
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined") localStorage.setItem(key, value)
    } catch {
      // private mode or quota exceeded
    }
  },
}

type ConsentData = {
  necessary: true
  analytics: boolean
  marketing: boolean
  timestamp: string
}

type View = "main" | "customise"

// visible starts false on both server and client — no hydration mismatch.
// It only becomes true inside a setTimeout callback after client mount.
export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [view, setView] = useState<View>("main")
  const [analyticsOn, setAnalyticsOn] = useState(false)
  const [marketingOn, setMarketingOn] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = safeLocalStorage.getItem(STORAGE_KEY)
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  // Re-open when Footer "Cookie preferences" link fires the event
  useEffect(() => {
    const handler = () => {
      const stored = safeLocalStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ConsentData
          setAnalyticsOn(parsed.analytics)
          setMarketingOn(parsed.marketing)
        } catch {
          setAnalyticsOn(false)
          setMarketingOn(false)
        }
      } else {
        setAnalyticsOn(false)
        setMarketingOn(false)
      }
      setView("main")
      setVisible(true)
    }
    window.addEventListener(OPEN_EVENT, handler)
    return () => window.removeEventListener(OPEN_EVENT, handler)
  }, [])

  useEffect(() => {
    if (visible && dialogRef.current) {
      const firstButton = dialogRef.current.querySelector<HTMLButtonElement>("button")
      firstButton?.focus()
    }
  }, [visible])

  const saveAndDismiss = useCallback((analytics: boolean, marketing: boolean) => {
    const data: ConsentData = {
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    }
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    window.dispatchEvent(new Event(SAVED_EVENT))
    setVisible(false)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cookie-banner"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-[720px] z-[100]"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-banner-title"
            className="bg-white rounded-2xl p-6"
            style={{
              boxShadow:
                "0 8px 32px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.08)",
            }}
          >
            <span id="cookie-banner-title" className="sr-only">Cookie preferences</span>
            {view === "main" ? (
              <MainView
                onAcceptAll={() => saveAndDismiss(true, true)}
                onReject={() => saveAndDismiss(false, false)}
                onCustomise={() => setView("customise")}
              />
            ) : (
              <CustomiseView
                analyticsOn={analyticsOn}
                marketingOn={marketingOn}
                onAnalyticsChange={setAnalyticsOn}
                onMarketingChange={setMarketingOn}
                onSave={() => saveAndDismiss(analyticsOn, marketingOn)}
                onBack={() => setView("main")}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MainView({
  onAcceptAll,
  onReject,
  onCustomise,
}: {
  onAcceptAll: () => void
  onReject: () => void
  onCustomise: () => void
}) {
  return (
    <div>
      <p className="text-[14px] text-slate-600 leading-[1.65] mb-4">
        RelayDesk uses cookies to keep our website working, understand how visitors use it, and improve our marketing.
        You can accept all cookies, reject non-essential cookies, or customise your preferences.{" "}
        <Link href="/privacy" className="text-ink hover:underline">
          Privacy Policy
        </Link>
      </p>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={onAcceptAll}
          className="sm:flex-none bg-ink hover:bg-ink-3 text-white text-[13px] font-semibold rounded-full px-5 py-2.5 transition-colors"
        >
          Accept all
        </button>
        <button
          onClick={onReject}
          className="sm:flex-none border border-slate-300 text-slate-700 hover:bg-slate-50 text-[13px] font-semibold rounded-full px-5 py-2.5 transition-colors"
        >
          Reject non-essential
        </button>
        <button
          onClick={onCustomise}
          className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors py-2.5 sm:px-2 text-left sm:text-center"
        >
          Customise
        </button>
      </div>
    </div>
  )
}

function CustomiseView({
  analyticsOn,
  marketingOn,
  onAnalyticsChange,
  onMarketingChange,
  onSave,
  onBack,
}: {
  analyticsOn: boolean
  marketingOn: boolean
  onAnalyticsChange: (v: boolean) => void
  onMarketingChange: (v: boolean) => void
  onSave: () => void
  onBack: () => void
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-slate-900 transition-colors mb-5"
      >
        <ChevronLeft />
        Back
      </button>

      <div className="space-y-0 divide-y divide-slate-100">
        <ToggleRow
          title="Strictly necessary cookies"
          description="Always active. Required for core website functionality such as page navigation, security, form submissions and remembering your cookie preferences."
          checked
          disabled
        />
        <ToggleRow
          title="Analytics cookies"
          description="Help us understand how visitors use our website so we can improve performance, usability and content."
          checked={analyticsOn}
          onChange={() => onAnalyticsChange(!analyticsOn)}
        />
        <ToggleRow
          title="Marketing cookies"
          description="Help us measure advertising performance and show more relevant marketing content."
          checked={marketingOn}
          onChange={() => onMarketingChange(!marketingOn)}
        />
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100">
        <button
          onClick={onSave}
          className="bg-ink hover:bg-ink-3 text-white text-[13px] font-semibold rounded-full px-6 py-2.5 transition-colors"
        >
          Save preferences
        </button>
      </div>
    </div>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: () => void
}) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-slate-900 mb-0.5">{title}</p>
        <p className="text-[13px] text-slate-500 leading-[1.6]">{description}</p>
      </div>
      {disabled ? (
        <span className="text-[11px] font-semibold text-ink uppercase tracking-[0.06em] mt-0.5 flex-shrink-0 whitespace-nowrap">
          Always on
        </span>
      ) : (
        <Toggle checked={checked} onChange={onChange} />
      )}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange?: () => void }) {
  return (
    <span className="inline-flex items-center justify-center flex-shrink-0 min-w-[44px] min-h-[44px]">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
          checked ? "bg-ink" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </span>
  )
}

function ChevronLeft() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
