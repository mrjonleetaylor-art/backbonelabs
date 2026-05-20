"use client"
import { useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const
const spring = [0.34, 1.56, 0.64, 1] as const

const steps = [
  {
    number: "01",
    title: "We learn your business",
    summary: "A 30-minute consultation to understand how your calls work.",
    example: "Sample question: 'What's your delivery cutoff for next-day arrangements?'",
  },
  {
    number: "02",
    title: "We configure RelayDesk",
    summary: "We set up your services, hours, FAQs, transfer rules, and payment links.",
    example: "Configured: services, hours, FAQs, transfer rules, payment links.",
  },
  {
    number: "03",
    title: "We sort the phone setup",
    summary: "Keep your number or get a new one - your choice.",
    example: "Setup time: most telcos complete call forwarding in under 5 minutes.",
  },
  {
    number: "04",
    title: "Go live",
    summary: "Your first call is usually within hours of setup.",
    example: "First 48 hours: we monitor every call and adjust in real time if needed.",
  },
  {
    number: "05",
    title: "Ongoing support",
    summary: "We're here whenever something needs updating.",
    example: "We tune your setup based on real call patterns each week.",
  },
]

function StepCard({
  step,
  example,
  fromLeft,
  delay,
}: {
  step: typeof steps[0]
  example: string
  fromLeft: boolean
  delay: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.55, ease, delay }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06)" }}
      className="bg-white rounded-2xl border border-slate-200 p-6 cursor-default"
      style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.04)" }}
    >
      <h3 className="text-[16px] font-semibold text-slate-900 tracking-[-0.01em] mb-2">
        {step.title}
      </h3>
      <p className="text-[14px] text-slate-500 leading-[1.6]">{step.summary}</p>

      <p
        className="text-[12px] text-[#1E3A5F] italic mt-3 pt-3 border-t border-slate-100 transition-opacity duration-200"
        style={{ opacity: hovered ? 1 : 0.4 }}
      >
        {example}
      </p>
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
    <section id="process" className="relative overflow-hidden bg-[#FAF9F5] pt-28 pb-24">
      <div
        className="absolute inset-x-0 top-0 pointer-events-none z-10"
        style={{ height: "80px", background: "linear-gradient(to bottom, #ffffff, transparent)" }}
      />
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mb-16"
        >
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] text-[#1E3A5F] mb-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            How it works
          </span>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.025em] text-slate-900 mt-1.5">
            We make sure you never miss another call
          </h2>
        </motion.div>

        {/* Zig-zag timeline */}
        <div ref={sectionRef} className="relative">

          {/* Vertical connecting line — desktop only */}
          <div className="absolute left-1/2 top-6 bottom-6 w-0.5 bg-slate-300 -translate-x-1/2 hidden lg:block overflow-hidden origin-top">
            <motion.div
              className="w-full bg-[#1E3A5F] origin-top"
              style={{ scaleY: lineScaleY, height: "100%" }}
            />
          </div>

          {/* Desktop: zig-zag three-column grid */}
          <div className="hidden lg:flex lg:flex-col">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0
              const circleColor = isLeft ? "#1E3A5F" : "#F59E0B"

              return (
                <div key={step.number} className="lg:grid lg:grid-cols-[1fr_64px_1fr] lg:gap-4 lg:items-center lg:mb-4">

                  {/* Left column */}
                  <div className="hidden lg:block">
                    {isLeft && (
                      <StepCard step={step} example={step.example} fromLeft delay={0.1} />
                    )}
                  </div>

                  {/* Center: circle + connector */}
                  <div className="hidden lg:flex justify-center py-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-5%" }}
                      transition={{ duration: 0.4, ease: spring }}
                      className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                      style={{ background: circleColor }}
                    >
                      <span className="text-[18px] font-bold text-white tabular-nums leading-none">
                        {step.number}
                      </span>
                    </motion.div>
                  </div>

                  {/* Right column */}
                  <div className="hidden lg:block">
                    {!isLeft && (
                      <StepCard step={step} example={step.example} fromLeft={false} delay={0.1} />
                    )}
                  </div>

                </div>
              )
            })}
          </div>

          {/* Mobile: alternating badge sides with snaking connector */}
          <div className="lg:hidden flex flex-col">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0
              const circleColor = isLeft ? "#1E3A5F" : "#F59E0B"

              return (
                <div key={`mob-${step.number}`}>
                  {/* Badge alternates: odd steps (01,03,05) left, even steps (02,04) right */}
                  <div className={`flex gap-4 items-start${!isLeft ? ' flex-row-reverse' : ''}`}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: circleColor }}
                    >
                      <span className="text-[13px] font-bold text-white tabular-nums leading-none">
                        {step.number}
                      </span>
                    </div>
                    <div className="flex-1">
                      <StepCard step={step} example={step.example} fromLeft={isLeft} delay={0} />
                    </div>
                  </div>

                  {/* Diagonal dashed connector to next step's badge.
                      The wrapper is offset by 20px (half badge width w-10=40px) and
                      shrunk by 40px total so 0% / 100% land exactly on badge centres. */}
                  {i < steps.length - 1 && (
                    <div style={{ marginLeft: "20px", width: "calc(100% - 40px)" }}>
                      <svg
                        width="100%"
                        height="44"
                        aria-hidden="true"
                        className="block overflow-visible"
                      >
                        <line
                          x1={isLeft ? "0%" : "100%"}
                          y1="6"
                          x2={isLeft ? "100%" : "0%"}
                          y2="38"
                          stroke="#CBD5E1"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
