"use client"

import type { ReactNode } from "react"

type PillProps = {
  children: ReactNode
  /** Selected state styling. */
  active?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Rounded toggle pill, as used by the hero demo selector. Presentational, with
 * an optional onClick, so it carries the "use client" boundary itself and can
 * be dropped into either server or client trees.
 */
export default function Pill({ children, active = false, onClick, className }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-full border px-3.5 py-[7px] text-[12.5px] font-semibold transition-all duration-150",
        active
          ? "border-transparent bg-ink text-white shadow-[0_8px_18px_-10px_rgba(10,20,34,0.6)]"
          : "border-hairline bg-white/[0.65] text-ink hover:-translate-y-px hover:border-[rgba(10,20,34,0.22)]",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  )
}
