"use client"
import { motion, useReducedMotion } from "framer-motion"
import { PHONE_DISPLAY, PHONE_HREF, EMAIL_HREF } from "@/lib/contact"
import { SignalArcs } from "@/components/brand"

const ease = [0.22, 1, 0.36, 1] as const

export default function FinalCTA() {
  const reduce = useReducedMotion()
  // Mount-triggered (not whileInView): the CTA content must be visible without
  // depending on an intersection observer firing. Reduced motion renders it
  // static.
  const inView = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease, delay },
        }

  return (
    <section className="relative isolate overflow-hidden bg-ink py-[120px] text-white">
      {/* Depth: radial gold+signal glow, concentric arcs, grain. All static. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-[30%] h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[20px]"
          style={{
            background:
              "radial-gradient(circle, rgba(245,165,36,0.20), rgba(45,194,160,0.10) 38%, transparent 60%)",
          }}
        />
        <SignalArcs
          rings={4}
          size={760}
          strokeOpacity={0.06}
          className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 text-white opacity-40"
        />
        <div className="grain" />
      </div>

      <div className="relative z-10 mx-auto max-w-[640px] px-6 text-center">
        <motion.h2
          {...inView(0)}
          className="font-display font-bold leading-[1.02] tracking-[-0.035em] text-white"
          style={{ fontSize: "clamp(34px, 4.5vw, 54px)" }}
        >
          Ready to stop missing <span className="text-gold">orders?</span>
        </motion.h2>

        <motion.p {...inView(0.1)} className="mx-auto mt-4 max-w-[520px] text-[17px] leading-[1.65] text-white/65">
          Give us a call now, or request a callback and we&apos;ll walk you through the right setup for
          your business.
        </motion.p>

        {/* Glowing gold phone number, preceded by a teal signal dot. */}
        <motion.a
          {...inView(0.18)}
          href={PHONE_HREF}
          className="mt-9 inline-flex items-center justify-center gap-4 font-display font-bold tabular-nums tracking-[-0.02em] text-gold rounded-full transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          style={{ fontSize: "clamp(34px, 4.4vw, 52px)", textShadow: "0 0 38px rgba(245,165,36,0.45)" }}
        >
          <span
            aria-hidden="true"
            className="inline-block h-[11px] w-[11px] flex-none rounded-full bg-signal"
            style={{ boxShadow: "0 0 14px var(--color-signal)" }}
          />
          {PHONE_DISPLAY}
        </motion.a>

        {/* Added line: live pulse + reassurance (Phase 0 reduced-motion guard). */}
        <motion.p
          {...inView(0.24)}
          className="mt-[18px] flex items-center justify-center gap-2 text-[13px] text-white/50"
        >
          <span className="live-dot" />
          Answering now · try it, you&apos;re talking to RelayDesk
        </motion.p>

        <motion.div {...inView(0.32)} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={PHONE_HREF}
            className="inline-flex items-center justify-center rounded-full bg-white px-[34px] py-4 text-[16px] font-semibold text-ink transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Give us a call
          </a>
          <a
            href={EMAIL_HREF}
            className="inline-flex items-center justify-center rounded-full border border-white/40 px-[34px] py-4 text-[16px] font-semibold text-white transition-all hover:border-white/70 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Request a callback
          </a>
        </motion.div>
      </div>
    </section>
  )
}
