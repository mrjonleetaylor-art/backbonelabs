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
    <section className="bg-slate-900 py-24" ref={sectionRef}>
      <div className="max-w-[620px] mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] text-white/50 mb-3.5">
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
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)" }}
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

            <a href="#pricing" className="inline-flex items-center gap-1 text-[13px] text-slate-400 hover:text-indigo-500 transition-colors mt-4">
              See pricing
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>

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
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const pct = ((value - min) / (max - min)) * 100

  function valueFromClientX(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect()
    const raw = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const stepped = Math.round((min + raw * (max - min)) / step) * step
    return Math.max(min, Math.min(max, stepped))
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
    onChange(valueFromClientX(e.clientX))
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    onChange(valueFromClientX(e.clientX))
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      onChange(Math.max(min, value - step))
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      onChange(Math.min(max, value + step))
    }
  }

  return (
    <div>
      <p className="block text-[13px] font-medium text-slate-700 mb-3">{label}</p>
      <div
        id={id}
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        className="relative cursor-pointer select-none focus:outline-none"
        style={{ height: "52px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        {/* Track */}
        <div
          className="absolute inset-x-0 rounded-full bg-slate-200 pointer-events-none"
          style={{ top: "50%", transform: "translateY(-50%)", height: "10px" }}
        >
          <div className="h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
        </div>

        {/* Fader grip */}
        <div
          className="absolute pointer-events-none"
          style={{ left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)" }}
        >
          <div
            style={{
              width: "56px",
              height: "46px",
              background: "#6366F1",
              borderRadius: "10px",
              boxShadow: "0 0 0 3px rgba(99,102,241,0.22), 0 6px 18px rgba(99,102,241,0.38)",
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
      <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
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
