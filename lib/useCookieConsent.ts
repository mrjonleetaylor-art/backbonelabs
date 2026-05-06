// Future analytics scripts should check this hook before loading.
// Usage: const { consent } = useCookieConsent()
// Gate: if (consent?.analytics) { /* load analytics */ }
import { useState, useEffect } from "react"

const STORAGE_KEY = "backbone_cookie_consent"

export type ConsentData = {
  necessary: true
  analytics: boolean
  marketing: boolean
  timestamp: string
}

function readStored(): ConsentData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ConsentData) : null
  } catch {
    return null
  }
}

export function useCookieConsent() {
  // Lazy initialiser reads localStorage on client mount without calling
  // setState inside an effect body.
  const [consent, setConsent] = useState<ConsentData | null>(readStored)

  useEffect(() => {
    // Keep consent in sync when the banner saves a new preference.
    const handler = () => setConsent(readStored())
    window.addEventListener("backbone:consent-saved", handler)
    return () => window.removeEventListener("backbone:consent-saved", handler)
  }, [])

  return { consent }
}
