type SignalArcsProps = {
  /** Rendered width and height in px. The arcs scale to fill it. */
  size?: number
  /** Stroke opacity for the arc lines, 0 to 1. */
  strokeOpacity?: number
  className?: string
}

/**
 * Concentric "answered signal" arcs, the recurring brand motif.
 * Presentational only. The stroke uses currentColor, so set the text colour on
 * a parent (e.g. text-ink on paper, text-white on the dark stages) to recolour
 * the arcs for the surface they sit on.
 */
export default function SignalArcs({
  size = 400,
  strokeOpacity = 0.1,
  className,
}: SignalArcsProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      stroke="currentColor"
      strokeOpacity={strokeOpacity}
      aria-hidden="true"
      className={className}
    >
      <circle cx="200" cy="200" r="80" />
      <circle cx="200" cy="200" r="130" />
      <circle cx="200" cy="200" r="180" />
    </svg>
  )
}
