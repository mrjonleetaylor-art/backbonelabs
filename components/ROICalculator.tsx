"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useInView, animate } from "framer-motion"
import { OVERFLOW_PRICE } from "@/lib/constants"
import { Eyebrow } from "@/components/brand"

const ease = [0.22, 1, 0.36, 1] as const

const DEFAULT_ANSWER_RATE = 85
const DEFAULT_ORDER_RATE = 50

function fmt(n: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(n)
}

export default function ROICalculator() {
  const [calls, setCalls] = useState(130)
  const [orderValue, setOrderValue] = useState(150)
  const [answerRate, setAnswerRate] = useState(DEFAULT_ANSWER_RATE)
  const [orderRate, setOrderRate] = useState(DEFAULT_ORDER_RATE)
  const [expanded, setExpanded] = useState(false)

  const missedCalls = Math.round(calls * (1 - answerRate / 100))
  const revenueAtRisk = Math.round(missedCalls * (orderRate / 100) * orderValue)
  const netGain = revenueAtRisk - OVERFLOW_PRICE
  const displayNetGain = Math.max(0, netGain)
  const netGainText = displayNetGain > 0 ? `+${fmt(displayNetGain)}` : "$0"

  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" })
  const hasAnimated = useRef(false)

  const mv = useMotionValue(0)
  const [displayVal, setDisplayVal] = useState(0)

  useEffect(() => {
    return mv.on("change", (v) => setDisplayVal(Math.round(v)))
  }, [mv])

  // Count-up: fires exactly once on first viewport entry. The hasAnimated guard
  // prevents re-triggering even though revenueAtRisk is in the dep array.
  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true
      animate(mv, revenueAtRisk, { duration: 0.6, ease: "easeOut" })
    }
  }, [isInView, mv, revenueAtRisk])

  // Slider updates after initial count-up: instant snap, no animation.
  useEffect(() => {
    if (hasAnimated.current) {
      mv.set(revenueAtRisk)
    }
  }, [revenueAtRisk, mv])

  return (
    <section className="bg-ink-2 py-24" ref={sectionRef}>
      <div className="max-w-[620px] mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-10"
        >
          <Eyebrow tone="onDark" className="mb-3.5">ROI calculator</Eyebrow>
          <h2 className="font-display text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.025em] text-white mt-1.5">
            How much are missed calls costing you?
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)]"
        >
          {/* Always-visible sliders */}
          <div className="p-8 pb-6 space-y-7">
            <SliderField
              id="roi-calls"
              label="Calls per month"
              value={calls}
              min={10}
              max={500}
              step={10}
              display={String(calls)}
              onChange={setCalls}
            />
            <SliderField
              id="roi-order-value"
              label="Average order value"
              value={orderValue}
              min={20}
              max={500}
              step={10}
              display={`$${orderValue}`}
              onChange={setOrderValue}
            />
          </div>

          {/* Hero output */}
          <div className="px-8 pb-8 text-center">
            <p className="text-[14px] text-ink/50 mb-0.5">You&apos;re losing about</p>
            <p
              className="font-display font-extrabold text-ink tabular-nums leading-[1] tracking-[-0.04em]"
              style={{ fontSize: "clamp(48px, 13vw, 88px)" }}
            >
              {fmt(displayVal)}
            </p>
            <p className="text-[14px] text-ink/50 mt-0.5 mb-6">every month.</p>

            <p className="text-[14px] text-ink/60 leading-[1.6]">
              RelayDesk Overflow gets these orders back for ${OVERFLOW_PRICE}/month.
            </p>

            <p className="text-[17px] font-bold tabular-nums mt-2 leading-snug text-gold">
              {netGainText}/month back in your pocket
            </p>

            <a
              href="#pricing"
              className="inline-flex items-center gap-1 text-[13px] text-ink/45 hover:text-ink transition-colors mt-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1"
            >
              See pricing
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>

            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[13px] text-ink/45 hover:text-ink transition-colors mt-5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1"
            >
              {expanded ? "Hide the working" : "Refine the numbers"}
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex"
              >
                <ChevronDown />
              </motion.span>
            </button>
          </div>

          {/* Expanded: extra sliders + output cards */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="expanded"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="border-t border-hairline px-8 pt-7 pb-6 space-y-7">
                  <SliderField
                    id="roi-answer-rate"
                    label="Calls you currently answer"
                    value={answerRate}
                    min={0}
                    max={100}
                    step={5}
                    display={`${answerRate}%`}
                    onChange={setAnswerRate}
                  />
                  <SliderField
                    id="roi-order-rate"
                    label="Callers who would place an order"
                    value={orderRate}
                    min={0}
                    max={100}
                    step={5}
                    display={`${orderRate}%`}
                    onChange={setOrderRate}
                  />
                </div>

                <div className="px-6 pb-7 pt-1 mx-2 mb-2 rounded-xl bg-paper grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <OutputCard
                    label="Missed calls per month"
                    value={String(missedCalls)}
                  />
                  <OutputCard
                    label="Revenue at risk per month"
                    value={fmt(revenueAtRisk)}
                  />
                  <OutputCard
                    label="Net monthly gain with RelayDesk Overflow"
                    value={netGain >= 0 ? `+${fmt(netGain)}` : fmt(netGain)}
                    highlight={netGain >= 0}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

type SliderProps = {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}

function SliderField({ id, label, value, min, max, step, display, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div>
      <p className="block text-[13px] font-medium text-ink/70 mb-3">{label}</p>
      {/* Native <input type="range"> sits invisible over the hit area.
          It handles mouse, touch, and keyboard natively — the custom
          pointer-event approach was unreliable on iOS/Android touch. */}
      <div className="relative" style={{ height: "52px" }}>
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus-visible:opacity-0"
          style={{ zIndex: 2 }}
        />

        {/* Visual track (pointer-events-none — input handles all interaction) */}
        <div
          className="pointer-events-none absolute inset-x-0 rounded-full bg-paper-2"
          style={{ top: "50%", transform: "translateY(-50%)", height: "10px" }}
        >
          <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
        </div>

        {/* Visual fader grip — purely decorative */}
        <div
          className="pointer-events-none absolute"
          style={{ left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)" }}
        >
          <div
            style={{
              width: "56px",
              height: "46px",
              background: "var(--color-ink)",
              borderRadius: "10px",
              boxShadow: "0 0 0 3px rgba(10,20,34,0.22), 0 6px 18px rgba(10,20,34,0.38)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
            }}
          >
            <span style={{ color: "white", fontSize: "13px", fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1, whiteSpace: "nowrap" }}>
              {display}
            </span>
            <div style={{ display: "flex", gap: "3.5px", alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: "2px", height: "7px", background: "rgba(255,255,255,0.32)", borderRadius: "1px" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between text-[11px] text-ink/40 mt-1.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

type OutputCardProps = {
  label: string
  value: string
  highlight?: boolean
}

function OutputCard({ label, value, highlight }: OutputCardProps) {
  return (
    <div className="bg-paper border border-hairline rounded-xl p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-ink/50 mb-2 leading-[1.4]">
        {label}
      </p>
      <p
        className="text-[26px] font-bold tracking-[-0.03em] leading-none tabular-nums"
        style={{ color: highlight ? "var(--color-gold)" : "var(--color-ink)" }}
      >
        {value}
      </p>
    </div>
  )
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
