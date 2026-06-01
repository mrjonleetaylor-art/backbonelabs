import type { ReactNode } from "react"

type GlassCardProps = {
  children: ReactNode
  className?: string
}

/**
 * Translucent, blurred card surface, the hero/demo card chrome. Wrap content
 * and pass extra classes to adjust padding, width, or layout. The shadow and
 * translucency are the comp's depth values.
 */
export default function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={[
        "rounded-[22px] border border-white/90 bg-white/[0.72] p-5 text-ink backdrop-blur-[20px]",
        "shadow-[0_1px_2px_rgba(10,20,34,0.04),0_24px_50px_-24px_rgba(10,20,34,0.28)]",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  )
}
