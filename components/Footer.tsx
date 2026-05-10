"use client"
import { EMAIL_HREF, PHONE_DISPLAY, PHONE_HREF } from "@/lib/contact"

export default function Footer() {
  function openCookieBanner() {
    window.dispatchEvent(new Event("relaydesk:open-cookie-banner"))
  }

  return (
    <footer className="border-t border-white/[0.06] py-7" style={{ background: "#0A0F1E" }}>
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-between gap-4">
        <div className="text-[14px] font-bold tracking-[-0.02em] text-white/60">
          Relay<span className="text-indigo-400">Desk</span>
        </div>
        <div className="flex flex-wrap gap-6">
          <a
            href={PHONE_HREF}
            className="text-[12px] text-white/30 hover:text-white/65 transition-colors"
          >
            {PHONE_DISPLAY}
          </a>
          <a
            href={EMAIL_HREF}
            className="text-[12px] text-white/30 hover:text-white/65 transition-colors"
          >
            hello@relaydesk.com.au
          </a>
          <a
            href="/privacy"
            className="text-[12px] text-white/30 hover:text-white/65 transition-colors"
          >
            Privacy Policy
          </a>
          <button
            onClick={openCookieBanner}
            className="text-[12px] text-white/30 hover:text-white/65 transition-colors"
          >
            Cookie preferences
          </button>
        </div>
        <p className="text-[12px] text-white/22">
          © {new Date().getFullYear()} RelayDesk. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
