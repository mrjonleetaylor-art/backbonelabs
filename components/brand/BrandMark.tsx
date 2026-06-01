type BrandMarkProps = {
  size?: number
  className?: string
}

/**
 * The RelayDesk logo mark, the small "answered signal" wave beside the
 * wordmark. Colours come from the brand tokens via CSS variables, so it stays
 * token-driven. Sits on light surfaces (the nav pill); the ink arc would
 * disappear on a dark background.
 */
export default function BrandMark({ size = 22, className }: BrandMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="3" fill="var(--color-gold)" />
      <path d="M5.5 12a6.5 6.5 0 0 1 13 0" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 12a9 9 0 0 1 18 0" stroke="var(--color-gold)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
