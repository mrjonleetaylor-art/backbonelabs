"use client"
import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import Image from "next/image"
import { Eyebrow } from "@/components/brand"

const ease = [0.22, 1, 0.36, 1] as const

function WordSwap({ trigger }: { trigger: boolean }) {
  return (
    <span className="relative inline-block" style={{ minWidth: "6.5ch" }}>
      <AnimatePresence mode="wait" initial={false}>
        {trigger ? (
          <motion.span
            key="answered"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="inline-block text-ink"
          >
            answered
          </motion.span>
        ) : (
          <motion.span
            key="missed"
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease }}
            className="inline-block"
          >
            missed
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

export default function Problem() {
  const [wordSwapped, setWordSwapped] = useState(false)
  const headlineRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(headlineRef, { once: true, margin: "-10%" })

  const imageRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"])

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => setWordSwapped(true), 700)
      return () => clearTimeout(t)
    }
  }, [isInView])

  return (
    <section className="overflow-hidden">
      {/* Headline + body copy */}
      <div className="bg-paper pt-24 pb-16">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-12" ref={headlineRef}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <Eyebrow className="mb-3.5">The problem</Eyebrow>
            <h2 className="font-display text-[clamp(32px,4vw,54px)] font-bold leading-[1.08] tracking-[-0.028em] text-ink mt-1.5 mb-5 lg:max-w-[700px]">
              Missed calls become <WordSwap trigger={wordSwapped} /> orders.
            </h2>
            <p className="text-[17px] text-ink/60 leading-[1.7] max-w-[480px]">
              Your busiest hours are when calls matter most. When you&apos;re with a customer, on a
              delivery, or elbow-deep in a Monday arrangement run, the phone still needs answering.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Image: parallax backdrop, right-aligned quote card */}
      <div ref={imageRef} className="relative overflow-hidden" style={{ minHeight: "62vh" }}>
        {/* Parallax background */}
        <motion.div
          className="absolute inset-0 scale-[1.15]"
          style={{ y: imageY }}
        >
          <Image
            src="/backdrop.jpeg"
            alt="Balloon and party styling display at an event"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>
        {/* Vignette */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(10,20,34,0.08) 0%, rgba(10,20,34,0.62) 100%)" }} />
        {/* Gradient bleed: matches DemoCall's bg-paper-2 above */}
        <div
          className="absolute top-0 inset-x-0 pointer-events-none z-10"
          style={{ height: "120px", background: "linear-gradient(to bottom, var(--color-paper-2), transparent)" }}
        />

        {/* Quote card — right-aligned on desktop */}
        <div className="relative z-20 w-full max-w-[1100px] mx-auto px-6 lg:px-12 py-20 flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.3 }}
            className="w-full max-w-[460px]"
          >
            {/* Solid white card — must be fully opaque; it floats over the
                busy backdrop image so any transparency kills readability. */}
            <div
              className="bg-white rounded-xl overflow-hidden"
              style={{ boxShadow: "0 16px 48px rgba(10,20,34,0.45), 0 4px 12px rgba(10,20,34,0.2)" }}
            >
              {/* Gold top bar */}
              <div className="h-1 bg-gold" />
              <div className="px-8 py-8">
                <p className="text-[clamp(17px,2.2vw,24px)] font-bold text-ink leading-[1.5] tracking-[-0.01em] mb-5">
                  &ldquo;Being a business owner and a mum, I used to dread missing calls. Now I don&apos;t even check my missed calls anymore.&rdquo;
                </p>
                <p className="text-[14px] font-semibold text-gold">
                  Sheena, local business owner, Menai NSW
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
