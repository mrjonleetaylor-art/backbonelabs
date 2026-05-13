"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useInView, animate } from "framer-motion"
import { OVERFLOW_PRICE } from "@/lib/constants"

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
    <section className="bg-indigo-500 py-24" ref={sectionRef}>
      <div className="max-w-[620px] mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] text-white/70 mb-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            ROI calculator
          </span>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.025em] text-white mt-1.5">
            How much are missed calls costing you?
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="bg-white rounded-2xl"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)" }}
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
            <p className="text-[14px] text-slate-400 mb-0.5">You&apos;re losing about</p>
            <p
              className="font-extrabold text-slate-900 tabular-nums leading-[1] tracking-[-0.04em]"
              style={{ fontSize: "clamp(48px, 13vw, 88px)" }}
            >
              {fmt(displayVal)}
            </p>
            <p className="text-[14px] text-slate-400 mt-0.5 mb-6">every month.</p>

            <p className="text-[14px] text-slate-500 leading-[1.6]">
              RelayDesk Overflow gets these orders back for ${OVERFLOW_PRICE}/month.
            </p>

            <p className="text-[17px] font-bold tabular-nums mt-2 leading-snug" style={{ color: "#06B6D4" }}>
              {netGainText}/month back in your pocket
            </p>

            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-indigo-500 transition-colors mt-5"
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
                <div className="border-t border-slate-100 px-8 pt-7 pb-6 space-y-7">
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

                <div className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
  // Thumb/pill centre: compensates for native thumb radius at track edges
  const thumbCenter = `calc(${pct}% + ${(8 - pct * 0.16).toFixed(2)}px)`

  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative" style={{ paddingTop: "30px" }}>
        {/* Floating value pill */}
        <div
          className="absolute top-0 pointer-events-none z-10"
          style={{ left: thumbCenter, transform: "translateX(-50%)" }}
        >
          <span
            className="inline-block bg-white text-slate-900 text-[12px] font-bold rounded px-2 py-0.5 whitespace-nowrap"
            style={{ boxShadow: "0 1px 4px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.06)" }}
          >
            {display}
          </span>
        </div>

        {/* Custom track + thumb */}
        <div className="relative flex items-center h-5">
          {/* Track */}
          <div className="absolute inset-x-0 h-[6px] rounded-full bg-slate-200 pointer-events-none">
            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
          </div>
          {/* Thumb */}
          <div
            className="absolute w-5 h-5 rounded-full bg-indigo-500 pointer-events-none z-10"
            style={{
              left: thumbCenter,
              transform: "translateX(-50%)",
              boxShadow: "0 0 0 3px rgba(99,102,241,0.22), 0 1px 4px rgba(15,23,42,0.18)",
            }}
          />
          {/* Native input — invisible, sits on top for full a11y */}
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-20"
          />
        </div>
      </div>
      <div className="flex justify-between text-[11px] text-slate-400 mt-1">
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
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-slate-400 mb-2 leading-[1.4]">
        {label}
      </p>
      <p
        className="text-[26px] font-bold tracking-[-0.03em] leading-none tabular-nums"
        style={{ color: highlight ? "#06B6D4" : "#0F172A" }}
      >
        {value}
      </p>
    </div>
  )
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
