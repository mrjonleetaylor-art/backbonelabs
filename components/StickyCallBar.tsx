"use client"
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/contact"

export default function StickyCallBar() {
  return (
    <a
      href={PHONE_HREF}
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-center gap-3 bg-indigo-500 text-white h-[60px] text-[16px] font-semibold"
    >
      <PhoneIcon />
      {PHONE_DISPLAY}
    </a>
  )
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.95 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2.88 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 18.92z" />
    </svg>
  )
}
