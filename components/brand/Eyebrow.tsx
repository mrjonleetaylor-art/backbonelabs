import type { ReactNode } from "react"

type EyebrowTone = "gold" | "signal" | "onDark"

type EyebrowProps = {
  children: ReactNode
  /** Colour treatment for the dot and label. Defaults to gold. */
  tone?: EyebrowTone
  className?: string
}

// The gold/signal text shades are the deepened, on-paper contrast values from
// the comp (the plain tokens are too light for small uppercase text on paper).
const toneText: Record<EyebrowTone, string> = {
  gold: "text-[#B5740B]",
  signal: "text-[#1A8C73]",
  onDark: "text-gold-soft",
}

const toneDot: Record<EyebrowTone, string> = {
  gold: "bg-gold",
  signal: "bg-signal",
  onDark: "bg-gold",
}

/**
 * Section eyebrow: a small dot followed by an uppercase, tracked label.
 * Use `tone="onDark"` on the ink-coloured stages.
 */
export default function Eyebrow({ children, tone = "gold", className }: EyebrowProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] ${toneText[tone]} ${className ?? ""}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${toneDot[tone]}`} />
      {children}
    </span>
  )
}
