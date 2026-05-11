"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { PHONE_DISPLAY, PHONE_HREF, EMAIL_HREF } from "@/lib/contact"

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
          className={`max-w-[1100px] mx-auto flex items-center justify-between pl-5 pr-2.5 h-[52px] rounded-full border border-slate-900/[0.09] pointer-events-auto transition-all duration-300 ${
            scrolled
              ? "bg-white shadow-[0_2px_4px_rgba(15,23,42,0.06),0_8px_28px_rgba(15,23,42,0.08)]"
              : "bg-white/[0.88] backdrop-blur-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_24px_rgba(15,23,42,0.06)]"
          }`}
        >
          <Link href="/" className="flex items-center gap-2 select-none">
            <Image
              src="/relaydesk_logo_assets/SVG/relaydesk-mark.svg"
              alt="RelayDesk"
              width={32}
              height={32}
              className="h-8 w-auto"
              unoptimized
              priority
            />
            <span className="hidden sm:inline text-[17px] font-bold tracking-[-0.025em]">
              <span className="text-slate-900">Relay</span>
              <span className="text-indigo-500">Desk</span>
            </span>
          </Link>

          {/* Desktop anchor links */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="text-[14px] font-normal text-slate-500 hover:text-slate-900 transition-colors duration-150"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={PHONE_HREF}
              className="hidden sm:block text-sm font-medium text-slate-900/50 hover:text-slate-900/80 transition-colors"
            >
              {PHONE_DISPLAY}
            </a>
            <div className="w-px h-4 bg-slate-300 hidden sm:block" />
            <motion.a
              href={EMAIL_HREF}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="hidden sm:inline-flex text-[13px] font-medium text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-full px-4 py-2 transition-all"
            >
              Request a callback
            </motion.a>
            <motion.a
              href={PHONE_HREF}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 0 4px rgba(99,102,241,0.4)",
                transition: { duration: 0.15 },
              }}
              whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
              className="text-[13px] font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-full px-[18px] py-2 transition-colors"
            >
              Give us a call
            </motion.a>

            {/* Hamburger — mobile only */}
            <button
              className="sm:hidden flex items-center justify-center w-11 h-11 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
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
              className="fixed inset-0 bg-slate-900/40 z-40 sm:hidden"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease }}
              className="fixed top-[72px] inset-x-4 z-50 sm:hidden bg-white/[0.97] backdrop-blur-xl rounded-2xl border border-slate-900/[0.09] shadow-[0_8px_32px_rgba(15,23,42,0.14)] overflow-hidden"
            >
              <div className="p-3">
                {/* Anchor links */}
                {NAV_LINKS.map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className="flex items-center text-[15px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl px-4 py-3 transition-colors"
                  >
                    {label}
                  </a>
                ))}

                <div className="h-px bg-slate-100 my-2" />

                {/* Phone number */}
                <a
                  href={PHONE_HREF}
                  onClick={closeMenu}
                  className="flex items-center text-[15px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl px-4 py-3 transition-colors"
                >
                  {PHONE_DISPLAY}
                </a>

                {/* CTA pills */}
                <div className="flex flex-col gap-2 mt-2 px-1 pb-1">
                  <a
                    href={EMAIL_HREF}
                    onClick={closeMenu}
                    className="block text-center text-[14px] font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-full py-2.5 transition-colors"
                  >
                    Request a callback
                  </a>
                  <a
                    href={PHONE_HREF}
                    onClick={closeMenu}
                    className="block text-center text-[14px] font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-full py-2.5 transition-colors"
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
