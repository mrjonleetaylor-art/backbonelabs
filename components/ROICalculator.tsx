"use client"
import { useState } from "react"
import FadeIn from "@/components/FadeIn"
import { MONTHLY_PRICE } from "@/lib/constants"

function formatAUD(n: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(n)
}

export default function ROICalculator() {
  const [calls, setCalls] = useState(120)
  const [orderValue, setOrderValue] = useState(85)
  const [answerRate, setAnswerRate] = useState(40)
  const [convertRate, setConvertRate] = useState(30)

  const missedCalls = Math.round(calls * (1 - answerRate / 100))
  const lostRevenue = Math.round(missedCalls * (convertRate / 100) * orderValue)
  const recovered = lostRevenue
  const roi = recovered - MONTHLY_PRICE

  return (
    <section className="bg-secondary border-t border-white/[0.06] py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-accent mb-4">
              ROI Calculator
            </p>
            <h2 className="font-serif font-bold text-3xl md:text-[2.6rem] text-cream mb-4 tracking-tight">
              See what you&apos;re leaving on the table
            </h2>
            <p className="font-sans text-muted max-w-md mx-auto leading-relaxed text-sm">
              Adjust the sliders to match your shop. The numbers update instantly.
            </p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/[0.06]">
          <FadeIn>
            <div className="bg-secondary p-8 md:p-10 space-y-8">
              <SliderField
                id="roi-calls"
                label="Calls per month"
                value={calls}
                min={10}
                max={500}
                step={5}
                display={String(calls)}
                onChange={setCalls}
              />
              <SliderField
                id="roi-order-value"
                label="Average order value"
                value={orderValue}
                min={20}
                max={500}
                step={5}
                display={`$${orderValue}`}
                onChange={setOrderValue}
              />
              <SliderField
                id="roi-answer-rate"
                label="Calls you currently answer"
                value={answerRate}
                min={0}
                max={100}
                step={1}
                display={`${answerRate}%`}
                onChange={setAnswerRate}
              />
              <SliderField
                id="roi-convert-rate"
                label="Callers who would place an order"
                value={convertRate}
                min={0}
                max={100}
                step={1}
                display={`${convertRate}%`}
                onChange={setConvertRate}
              />
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="bg-secondary p-8 md:p-10">
              <div className="grid grid-cols-2 gap-px bg-white/[0.06] mb-5">
                <OutputCard label="Missed calls / month" value={String(missedCalls)} />
                <OutputCard label="Revenue lost / month" value={formatAUD(lostRevenue)} variant="warn" />
                <OutputCard label="Revenue recovered" value={formatAUD(recovered)} variant="good" />
                <OutputCard
                  label={`Net ROI vs $${MONTHLY_PRICE}/mo`}
                  value={roi >= 0 ? `+${formatAUD(roi)}` : formatAUD(roi)}
                  variant={roi >= 0 ? "good" : "bad"}
                />
              </div>
              <p className="font-sans text-muted/40 text-xs text-center">
                Estimates only, based on your inputs above.
              </p>
            </div>
          </FadeIn>
        </div>
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
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label htmlFor={id} className="font-sans text-sm text-muted">{label}</label>
        <span className="font-sans font-semibold text-accent text-sm tabular-nums">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-px appearance-none bg-white/10 cursor-pointer"
        style={{ accentColor: "#D4823A" }}
      />
      <div className="flex justify-between text-muted/30 text-xs mt-1.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

type OutputCardProps = {
  label: string
  value: string
  variant?: "warn" | "good" | "bad"
}

function OutputCard({ label, value, variant }: OutputCardProps) {
  const valueClass =
    variant === "good"
      ? "text-emerald-400"
      : variant === "bad"
        ? "text-red-400"
        : variant === "warn"
          ? "text-accent"
          : "text-cream"

  return (
    <div className="bg-primary p-5">
      <p className="font-sans text-muted/60 text-[11px] uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-serif font-bold text-2xl tabular-nums ${valueClass}`}>{value}</p>
    </div>
  )
}
