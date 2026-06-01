"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { PHONE_HREF } from "@/lib/contact"
import CallbackForm from "@/components/CallbackForm"
import { Eyebrow, Pill, GlassCard, SignalArcs } from "@/components/brand"

const ease = [0.22, 1, 0.36, 1] as const

// Inline-bold segments so the agent lines can emphasise the captured detail,
// matching the comp. `b` marks a bolded run.
type Part = { t: string; b?: boolean }
type Line = { role: "caller" | "agent"; parts: Part[] }

type Scenario = {
  pill: string
  avatar: string
  avatarColor: string
  name: string
  meta: string
  lines: Line[]
  outcome: { title: string; detail: string }
}

// Placeholder demo copy, lifted verbatim from the design comp's HERO array.
// A later copy phase revises this; do not rewrite it here.
const SCENARIOS: Scenario[] = [
  {
    pill: "Order",
    avatar: "M",
    avatarColor: "#C77D2B",
    name: "New caller",
    meta: "Greenwood Florist · incoming",
    lines: [
      { role: "caller", parts: [{ t: "Hi, do you have sunflowers in this Saturday?" }] },
      {
        role: "agent",
        parts: [
          { t: "We do, fresh in Friday. Would you like a " },
          { t: "bunch set aside for pickup", b: true },
          { t: "?" },
        ],
      },
      { role: "caller", parts: [{ t: "Yes please, a big one. Name's Marcus." }] },
    ],
    outcome: { title: "Order captured", detail: "Sunflowers, Sat pickup · summary sent to you" },
  },
  {
    pill: "Booking",
    avatar: "P",
    avatarColor: "#1B3052",
    name: "Priya N.",
    meta: "Greenwood Florist · incoming",
    lines: [
      { role: "caller", parts: [{ t: "Can I book a consult for our wedding flowers next week?" }] },
      {
        role: "agent",
        parts: [
          { t: "Of course. I've got " },
          { t: "Tuesday 10am or Wednesday 2pm", b: true },
          { t: " free, which suits?" },
        ],
      },
      { role: "caller", parts: [{ t: "Tuesday 10 is perfect." }] },
    ],
    outcome: { title: "Appointment booked", detail: "Tue 10am · reminder set, added to your calendar" },
  },
  {
    pill: "Stock & delivery",
    avatar: "J",
    avatarColor: "#1A8C73",
    name: "New caller",
    meta: "Greenwood Florist · incoming",
    lines: [
      { role: "caller", parts: [{ t: "Do you deliver to Caringbah?" }] },
      {
        role: "agent",
        parts: [
          { t: "We do, " },
          { t: "$15 and same-day if you order before noon", b: true },
          { t: ". Want me to start an order?" },
        ],
      },
      { role: "caller", parts: [{ t: "Yes, a get-well bunch." }] },
    ],
    outcome: { title: "Order captured", detail: "Caringbah delivery · same-day" },
  },
  {
    pill: "Callback (wedding)",
    avatar: "S",
    avatarColor: "#9A4A2B",
    name: "New caller",
    meta: "After hours · 9:12pm",
    lines: [
      { role: "caller", parts: [{ t: "I know you're closed, just after a quote for a wedding in March." }] },
      {
        role: "agent",
        parts: [
          { t: "Happy to take the details and have " },
          { t: "Sheena call you first thing", b: true },
          { t: ". Roughly how many guests?" },
        ],
      },
      { role: "caller", parts: [{ t: "About 60." }] },
    ],
    outcome: { title: "Lead captured", detail: "Wedding callback flagged for the morning" },
  },
]

const TRUST = ["Answers when you can't", "24/7 availability", "No lock-in"]

// Deterministic waveform bars (no Math.random, so server and client markup
// match). The CSS keyframe animates height; these are the at-rest heights used
// when prefers-reduced-motion disables the animation.
const WAVE = Array.from({ length: 24 }, (_, i) => ({
  height: 26 + ((i * 53) % 58),
  delay: ((i * 7) % 42) / 100,
}))

export default function Hero() {
  const [active, setActive] = useState(0)
  const [callbackOpen, setCallbackOpen] = useState(false)
  const reduce = useReducedMotion()
  const scenario = SCENARIOS[active] ?? SCENARIOS[0]

  // Entrance animation, disabled under reduced motion.
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease, delay },
        }

  // Crossfade for the per-scenario content on pill swap.
  const fade = {
    initial: reduce ? false : { opacity: 0 },
    animate: { opacity: 1 },
    exit: reduce ? { opacity: 1 } : { opacity: 0 },
    transition: { duration: reduce ? 0 : 0.25, ease },
  }

  return (
    <section className="relative isolate overflow-hidden bg-paper pt-20 pb-16 sm:pt-[100px] lg:pt-[120px] lg:pb-24">
      {/* Depth layer: gold + signal glows and grain (Phase 0 helpers). */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="glow-gold left-[-120px] top-[-200px] h-[620px] w-[620px]" />
        <div className="glow-signal bottom-[-200px] right-[-140px] h-[560px] w-[560px]" />
        <div className="grain" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1160px] px-7">
        <div className="grid grid-cols-1 items-center gap-0 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Left: copy */}
          <div>
            <motion.div {...rise(0.05)} className="mb-6">
              <Eyebrow variant="pill" live>
                Built for Australian businesses
              </Eyebrow>
            </motion.div>

            <h1 className="font-display text-[clamp(44px,5.4vw,74px)] font-bold leading-[1.0] tracking-[-0.035em] text-ink">
              <motion.span {...rise(0.1)} className="block">
                Every call answered.
              </motion.span>
              <motion.span {...rise(0.18)} className="block text-gold">
                Every order captured.
              </motion.span>
            </h1>

            <motion.p {...rise(0.28)} className="mt-6 max-w-[460px] text-[17px] sm:text-[19px] leading-[1.65] text-ink/60">
              RelayDesk picks up when you can&apos;t, takes the order, answers the question, and sends
              you the details. No missed calls. No queue. No engaged tone.
            </motion.p>

            <motion.div {...rise(0.38)} className="mt-8 flex flex-wrap gap-3">
              <a
                href={PHONE_HREF}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(10,20,34,0.4),0_10px_24px_-10px_rgba(10,20,34,0.55)] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                <PhoneIcon />
                Give us a call
              </a>
              <button
                type="button"
                onClick={() => setCallbackOpen(true)}
                className="inline-flex items-center rounded-full border border-hairline bg-transparent px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-[rgba(10,20,34,0.2)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                Request a callback
              </button>
            </motion.div>

            <motion.div {...rise(0.48)} className="mt-8 flex flex-wrap gap-6">
              {TRUST.map((item) => (
                <span key={item} className="flex items-center gap-2 text-[13.5px] font-medium text-ink/60">
                  <Tick />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: interactive call demo */}
          <motion.div {...rise(0.2)}>
            {/* Mobile separator — a clear break between pitch copy and the
                demo unit below. Hidden on lg where the two-column grid does
                the separating. */}
            <div className="mt-10 mb-6 border-t border-hairline lg:hidden" />

            {/* Mobile demo container — subtle surface so the pills + card
                read as one distinct product unit, not free-floating elements.
                Transparent on lg (the column layout does the job). */}
            <div className="rounded-2xl bg-white/50 px-4 pb-5 pt-4 ring-1 ring-hairline backdrop-blur-[2px] lg:rounded-none lg:bg-transparent lg:p-0 lg:ring-0 lg:backdrop-blur-none">
            {/* Scenario pills */}
            <div className="mb-3.5 flex flex-wrap items-center gap-2">
              <span className="mr-0.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink/55">
                Try a call
              </span>
              {SCENARIOS.map((s, i) => (
                <Pill key={s.pill} active={active === i} onClick={() => setActive(i)}>
                  {s.pill}
                </Pill>
              ))}
            </div>

            {/* Call card with arcs behind it */}
            <div className="relative">
              <SignalArcs
                size={460}
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-ink opacity-50"
              />

              <GlassCard className="relative">
                {/* Header: identity (swaps) + live indicator (constant) */}
                <div className="flex items-center justify-between border-b border-hairline pb-3.5">
                  <AnimatePresence mode="wait">
                    <motion.div key={active} {...fade} className="flex items-center gap-2.5">
                      <span
                        className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full text-[13px] font-semibold text-white"
                        style={{ background: scenario.avatarColor }}
                      >
                        {scenario.avatar}
                      </span>
                      <span className="block">
                        <span className="block text-[14px] font-semibold text-ink">{scenario.name}</span>
                        <span className="block text-[11.5px] text-ink/55">{scenario.meta}</span>
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  <span className="flex flex-none items-center gap-1.5 rounded-full bg-[rgba(45,194,160,0.12)] px-2.5 py-1 text-[11.5px] font-semibold text-[#1A8C73]">
                    <span className="live-dot" />
                    Live · 0:14
                  </span>
                </div>

                {/* Waveform (constant) */}
                <div className="my-4 flex h-[30px] items-center justify-center gap-[3px]" aria-hidden="true">
                  {WAVE.map((bar, i) => (
                    <i
                      key={i}
                      className={`wave-bar w-[3px] rounded-full ${i % 2 === 0 ? "bg-gold" : "bg-signal"}`}
                      style={{ height: `${bar.height}%`, animationDelay: `${bar.delay}s` }}
                    />
                  ))}
                </div>

                {/* Conversation + captured outcome (swaps) */}
                <AnimatePresence mode="wait">
                  <motion.div key={active} {...fade}>
                    {scenario.lines.map((line, i) => (
                      <div
                        key={i}
                        className={
                          line.role === "caller"
                            ? "mb-2 max-w-[88%] rounded-[14px] rounded-bl-[4px] bg-[#EEEAE1] px-3.5 py-2.5 text-[13px] leading-[1.55] text-ink"
                            : "mb-2 ml-auto max-w-[88%] rounded-[14px] rounded-br-[4px] bg-[rgba(245,165,36,0.16)] px-3.5 py-2.5 text-[13px] leading-[1.55] text-ink"
                        }
                      >
                        {line.parts.map((part, j) =>
                          part.b ? (
                            <b key={j} className="font-semibold text-[#B5740B]">
                              {part.t}
                            </b>
                          ) : (
                            <span key={j}>{part.t}</span>
                          ),
                        )}
                      </div>
                    ))}

                    <div className="mt-3 flex items-center gap-2.5 rounded-[14px] bg-[rgba(45,194,160,0.12)] px-3.5 py-2.5">
                      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-signal text-white">
                        <CheckIcon />
                      </span>
                      <span className="text-[12.5px] text-ink">
                        <b className="font-semibold text-[#1A8C73]">{scenario.outcome.title}</b>{" "}
                        <span className="text-ink/55">{scenario.outcome.detail}</span>
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </GlassCard>
            </div>
            </div>{/* end mobile demo container */}
          </motion.div>
        </div>
      </div>

      <CallbackForm isOpen={callbackOpen} onClose={() => setCallbackOpen(false)} />
    </section>
  )
}

// Gold gradient tick used in the trust row; ink check for contrast.
function Tick() {
  return (
    <span
      className="flex h-[19px] w-[19px] flex-none items-center justify-center rounded-full text-ink"
      style={{
        background: "linear-gradient(180deg, var(--color-gold-soft), var(--color-gold))",
        boxShadow: "0 2px 6px -1px rgba(245,165,36,0.5)",
      }}
    >
      <CheckIcon size={10} />
    </span>
  )
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.95 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2.88 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 18.92z" />
    </svg>
  )
}

function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 6l3 3 5-5" />
    </svg>
  )
}
