type SignalArcsProps = {
  /** Rendered width and height in px. The arcs scale to fill it. */
  size?: number
  /** Stroke opacity for the arc lines, 0 to 1. */
  strokeOpacity?: number
  /** Number of concentric rings, spaced 50 units apart from r=80. Default 3. */
  rings?: number
  className?: string
}

/**
 * Concentric "answered signal" arcs, the recurring brand motif.
 * Presentational only. The stroke uses currentColor, so set the text colour on
 * a parent (e.g. text-ink on paper, text-white on the dark stages) to recolour
 * the arcs for the surface they sit on. Rings beyond the viewBox are clipped to
 * arcs, which is the intended look on the dark CTA.
 */
export default function SignalArcs({
  size = 400,
  strokeOpacity = 0.1,
  rings = 3,
  className,
}: SignalArcsProps) {
  const radii = Array.from({ length: rings }, (_, i) => 80 + i * 50)
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
      {radii.map((r) => (
        <circle key={r} cx="200" cy="200" r={r} />
      ))}
    </svg>
  )
}
