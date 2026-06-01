"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { PHONE_DISPLAY, PHONE_HREF, EMAIL_HREF } from "@/lib/contact"
import { BrandMark } from "@/components/brand"

const NAV_LINKS = [
  { label: "How it works", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
]

const ease = [0.22, 1, 0.36, 1] as const

export default function Nav() {
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 20
  )
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const closeMenu = () => setOpen(false)

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 px-4 sm:px-6 pt-3.5 pointer-events-none">
        <motion.nav
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`max-w-[1100px] mx-auto flex items-center justify-between pl-5 pr-2.5 h-[52px] rounded-full border border-hairline pointer-events-auto transition-all duration-300 ${
            scrolled
              ? "bg-paper-2 shadow-[0_2px_4px_rgba(10,20,34,0.06),0_8px_28px_rgba(10,20,34,0.08)]"
              : "bg-paper-2/[0.88] backdrop-blur-2xl shadow-[0_1px_2px_rgba(10,20,34,0.04),0_6px_24px_rgba(10,20,34,0.06)]"
          }`}
        >
          <Link href="/" className="flex items-center gap-2 select-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2">
            <BrandMark size={22} />
            <span className="text-[17px] font-bold tracking-[-0.025em]">
              <span className="text-ink">Relay</span>
              <span className="text-gold">Desk</span>
            </span>
          </Link>

          {/* Desktop anchor links */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="text-[14px] font-normal text-ink/55 hover:text-ink transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={PHONE_HREF}
              className="hidden sm:block text-sm font-medium text-ink/50 hover:text-ink/80 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2"
            >
              {PHONE_DISPLAY}
            </a>
            <div className="w-px h-4 bg-hairline hidden sm:block" />
            <motion.a
              href={EMAIL_HREF}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="hidden sm:inline-flex whitespace-nowrap text-[13px] font-medium text-ink border border-hairline hover:border-[rgba(10,20,34,0.2)] hover:bg-white rounded-full px-4 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2"
            >
              Request a callback
            </motion.a>
            <motion.a
              href={PHONE_HREF}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 0 4px rgba(10,20,34,0.35)",
                transition: { duration: 0.15 },
              }}
              whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
              className="text-[13px] font-semibold text-white bg-ink hover:bg-ink-3 rounded-full px-[18px] py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2"
            >
              Give us a call
            </motion.a>

            {/* Hamburger — mobile only */}
            <button
              className="sm:hidden flex items-center justify-center w-11 h-11 rounded-full text-ink/70 hover:bg-ink/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span
                    key="x"
                    initial={{ opacity: 0, rotate: -45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.15 }}
                    className="flex"
                  >
                    <XIcon />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ opacity: 0, rotate: 45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -45 }}
                    transition={{ duration: 0.15 }}
                    className="flex"
                  >
                    <MenuIcon />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.nav>
      </div>

      {/* Mobile drawer — sm:hidden via conditional render + CSS */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-ink/40 z-40 sm:hidden"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease }}
              className="fixed top-[72px] inset-x-4 z-50 sm:hidden bg-paper-2/[0.97] backdrop-blur-xl rounded-2xl border border-hairline shadow-[0_8px_32px_rgba(10,20,34,0.14)] overflow-hidden"
            >
              <div className="p-3">
                {/* Anchor links */}
                {NAV_LINKS.map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className="flex items-center text-[15px] font-medium text-ink hover:bg-ink/[0.04] rounded-xl px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-inset"
                  >
                    {label}
                  </a>
                ))}

                <div className="h-px bg-hairline my-2" />

                {/* Phone number */}
                <a
                  href={PHONE_HREF}
                  onClick={closeMenu}
                  className="flex items-center text-[15px] font-medium text-ink/60 hover:text-ink hover:bg-ink/[0.04] rounded-xl px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-inset"
                >
                  {PHONE_DISPLAY}
                </a>

                {/* CTA pills */}
                <div className="flex flex-col gap-2 mt-2 px-1 pb-1">
                  <a
                    href={EMAIL_HREF}
                    onClick={closeMenu}
                    className="block text-center text-[14px] font-medium text-ink border border-hairline hover:bg-ink/[0.04] rounded-full py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2"
                  >
                    Request a callback
                  </a>
                  <a
                    href={PHONE_HREF}
                    onClick={closeMenu}
                    className="block text-center text-[14px] font-semibold text-white bg-ink hover:bg-ink-3 rounded-full py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2"
                  >
                    Give us a call
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
