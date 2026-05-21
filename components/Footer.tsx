"use client"

export default function Footer() {
  function openCookieBanner() {
    window.dispatchEvent(new Event("relaydesk:open-cookie-banner"))
  }

  return (
    <footer className="border-t border-white/[0.06] py-5" style={{ background: "#0A0F1E" }}>
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
        <span className="text-[14px] font-bold tracking-[-0.02em] text-white/55 flex-shrink-0">
          <span className="text-white">Relay</span><span className="text-[#F59E0B]">Desk</span>
        </span>
        <div className="flex items-center gap-5">
          <a href="/terms" className="text-[12px] text-white/30 hover:text-white/60 transition-colors whitespace-nowrap">
            Terms
          </a>
          <a href="/privacy" className="text-[12px] text-white/30 hover:text-white/60 transition-colors whitespace-nowrap">
            Privacy
          </a>
          <button onClick={openCookieBanner} className="text-[12px] text-white/30 hover:text-white/60 transition-colors whitespace-nowrap">
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
