"use client"
import { useState, useEffect } from "react"
import { PHONE_DISPLAY, PHONE_HREF, EMAIL_HREF } from "@/lib/contact"

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setScrolled(window.scrollY > 40)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0C1410]/95 backdrop-blur-md border-b border-white/[0.06]"
          : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <a href="#" className="font-serif font-bold text-xl text-cream tracking-tight select-none">
          Backbone<span className="text-accent"> Labs</span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href={PHONE_HREF}
            className="hidden sm:block font-sans text-cream/60 hover:text-cream text-sm font-medium tracking-wide transition-colors"
          >
            {PHONE_DISPLAY}
          </a>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <a
            href={EMAIL_HREF}
            className="text-cream/70 hover:text-cream text-sm font-medium px-4 py-2 rounded border border-white/10 hover:border-white/20 transition-all"
          >
            Book a demo
          </a>
          <a
            href={PHONE_HREF}
            className="bg-accent hover:bg-accent-light text-cream text-sm font-semibold px-4 py-2 rounded transition-colors"
          >
            Call us
          </a>
        </div>
      </div>
    </nav>
  )
}
