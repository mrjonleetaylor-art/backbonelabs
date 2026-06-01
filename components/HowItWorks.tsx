"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Eyebrow } from "@/components/brand"

const ease = [0.22, 1, 0.36, 1] as const
const spring = [0.34, 1.56, 0.64, 1] as const

const steps = [
  {
    number: "01",
    title: "Discovery call",
    summary: "We learn how your business handles calls: your services, hours, and what customers ask most. About 20 minutes.",
  },
  {
    number: "02",
    title: "We set it up",
    summary: "We build and configure your agent, then give you access to try it out yourself before any real calls come through.",
  },
  {
    number: "03",
    title: "Connect your number",
    summary: "Forward your existing number to us, or we'll give you a new one. Your choice, and it takes minutes.",
  },
  {
    number: "04",
    title: "That's it, you're live",
    summary: "Every call answered from day one. No long setup, no fuss.",
  },
]

// Odd steps (01, 03) get ink; even steps (02, 04) get gold. Mirrors the old
// left/right colour alternation but uses brand tokens.
const stepColors = ["bg-ink", "bg-gold", "bg-ink", "bg-gold"]

function StepCard({
  step,
  fromLeft,
  delay,
}: {
  step: typeof steps[0]
  fromLeft: boolean
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease, delay }}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(10,20,34,0.12), 0 2px 8px rgba(10,20,34,0.06)" }}
      className="rounded-2xl border border-hairline bg-white p-6 cursor-default shadow-[0_1px_3px_rgba(10,20,34,0.06),0_4px_12px_rgba(10,20,34,0.04)]"
    >
      <h3 className="text-[16px] font-semibold text-ink tracking-[-0.01em] mb-2">
        {step.title}
      </h3>
      <p className="text-[14px] text-ink/60 leading-[1.6]">{step.summary}</p>
    </motion.div>
  )
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.6"],
  })
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="process" className="relative overflow-hidden bg-paper pt-28 pb-24">
      <div
        className="absolute inset-x-0 top-0 pointer-events-none z-10"
        style={{ height: "80px", background: "linear-gradient(to bottom, var(--color-paper-2), transparent)" }}
      />
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-16"
        >
          <Eyebrow className="mb-3.5">How it works</Eyebrow>
          <h2 className="font-display text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.025em] text-ink mt-1.5">
            Up and running in four easy steps
          </h2>
        </motion.div>

        {/* Zig-zag timeline */}
        <div ref={sectionRef} className="relative">

          {/* Vertical connecting line — desktop only */}
          <div className="absolute left-1/2 top-6 bottom-6 w-0.5 bg-hairline -translate-x-1/2 hidden lg:block overflow-hidden origin-top">
            <motion.div
              className="w-full bg-ink origin-top"
              style={{ scaleY: lineScaleY, height: "100%" }}
            />
          </div>

          {/* Desktop: zig-zag three-column grid */}
          <div className="hidden lg:flex lg:flex-col">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0

              return (
                <div key={step.number} className="lg:grid lg:grid-cols-[1fr_64px_1fr] lg:gap-4 lg:items-center lg:mb-4">

                  {/* Left column */}
                  <div className="hidden lg:block">
                    {isLeft && (
                      <StepCard step={step} fromLeft delay={0.1} />
                    )}
                  </div>

                  {/* Center: circle */}
                  <div className="hidden lg:flex justify-center py-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: spring }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${stepColors[i]}`}
                    >
                      <span className="text-[18px] font-bold text-white tabular-nums leading-none">
                        {step.number}
                      </span>
                    </motion.div>
                  </div>

                  {/* Right column */}
                  <div className="hidden lg:block">
                    {!isLeft && (
                      <StepCard step={step} fromLeft={false} delay={0.1} />
                    )}
                  </div>

                </div>
              )
            })}
          </div>

          {/* Mobile: badges left-aligned, steps stacked */}
          <div className="lg:hidden flex flex-col gap-7">
            {steps.map((step, i) => (
              <div key={`mob-${step.number}`} className="flex gap-4 items-start">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${stepColors[i]}`}
                >
                  <span className="text-[13px] font-bold text-white tabular-nums leading-none">
                    {step.number}
                  </span>
                </div>
                <div className="flex-1">
                  <StepCard step={step} fromLeft delay={0} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
