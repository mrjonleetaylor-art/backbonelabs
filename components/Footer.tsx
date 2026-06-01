"use client"

export default function Footer() {
  function openCookieBanner() {
    window.dispatchEvent(new Event("relaydesk:open-cookie-banner"))
  }

  return (
    <footer className="border-t border-white/[0.06] bg-ink py-5">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <span className="text-[14px] font-bold tracking-[-0.02em] flex-shrink-0">
          <span className="text-white">Relay</span><span className="text-gold">Desk</span>
        </span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <a href="/terms" className="text-[12px] text-white/30 hover:text-white/60 transition-colors whitespace-nowrap rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
            Terms
          </a>
          <a href="/privacy" className="text-[12px] text-white/30 hover:text-white/60 transition-colors whitespace-nowrap rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
            Privacy
          </a>
          <button onClick={openCookieBanner} className="text-[12px] text-white/30 hover:text-white/60 transition-colors whitespace-nowrap rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
            Cookies
          </button>
          <span className="text-[12px] text-white/20 whitespace-nowrap">
            © {new Date().getFullYear()} RelayDesk
          </span>
        </div>
      </div>
    </footer>
  )
}
