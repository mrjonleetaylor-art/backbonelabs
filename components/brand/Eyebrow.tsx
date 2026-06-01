import type { ReactNode } from "react"

type EyebrowTone = "gold" | "signal" | "onDark"
type EyebrowVariant = "label" | "pill"

type EyebrowProps = {
  children: ReactNode
  /** Colour treatment for the dot and label. Defaults to gold. */
  tone?: EyebrowTone
  /**
   * "label" (default): uppercase, tracked section eyebrow.
   * "pill": rounded chrome with a normal-case label, as used in the hero.
   */
  variant?: EyebrowVariant
  /** Use the pulsing signal "live" dot instead of a static tone dot. */
  live?: boolean
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
 * Use `tone="onDark"` on the ink-coloured stages, `variant="pill"` for the
 * hero's rounded chrome, and `live` for the pulsing signal dot.
 */
export default function Eyebrow({
  children,
  tone = "gold",
  variant = "label",
  live = false,
  className,
}: EyebrowProps) {
  const dot = live ? (
    <span className="live-dot" />
  ) : (
    <span className={`h-1.5 w-1.5 rounded-full ${toneDot[tone]}`} />
  )

  if (variant === "pill") {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border border-hairline bg-white/60 px-3 py-1.5 text-[12.5px] font-semibold text-ink ${className ?? ""}`}
      >
        {dot}
        {children}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] ${toneText[tone]} ${className ?? ""}`}
    >
      {dot}
      {children}
    </span>
  )
}
