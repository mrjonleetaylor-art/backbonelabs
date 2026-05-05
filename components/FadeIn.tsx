"use client"
import { useEffect, useRef } from "react"

type Props = {
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function FadeIn({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            timeoutId = setTimeout(() => el.classList.add("is-visible"), delay)
          } else {
            el.classList.add("is-visible")
          }
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [delay])

  return (
    <div ref={ref} className={`fade-in-section ${className}`}>
      {children}
    </div>
  )
}
