"use client"
import { useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { PHONE_HREF, EMAIL_HREF } from "@/lib/contact"
import CallTranscript, { type CallTranscriptHandle } from "@/components/CallTranscript"

const ease = [0.22, 1, 0.36, 1] as const

const slideUp = (delay: number) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease, delay },
})

const summaryRows = [
  { label: "Caller",   value: "Emma R." },
  { label: "Request",  value: "Custom arrangement, delivery at 12" },
  { label: "Contact",  value: "0411 XXX XXX" },
  { label: "Status",   value: "Booking made for tomorrow at 12. $100 deposit received.", highlight: true },
]

export default function Hero() {
  const [summaryVisible, setSummaryVisible] = useState(false)
  const [activeConv, setActiveConv] = useState(0)
  const transcriptRef = useRef<CallTranscriptHandle>(null)

  const handleConvChange = useCallback((idx: number) => setActiveConv(idx), [])

  const handleDotClick = (i: number) => {
    setActiveConv(i)
    transcriptRef.current?.jumpTo(i)
  }

  return (
    <section className="min-h-screen flex items-center bg-white overflow-hidden relative pt-[120px] pb-20">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 30% 40%, rgba(99,102,241,0.04) 0%, transparent 65%)",
        }}
      />

      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div>
            <motion.div
              {...slideUp(0.05)}
              className="inline-flex items-center gap-2 bg-indigo-500 rounded-full px-3.5 py-1.5 mb-7"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
              <span className="text-[12px] font-semibold text-white tracking-[-0.005em]">
                Call handling for local businesses
              </span>
            </motion.div>

            <h1 className="text-[clamp(44px,5.5vw,72px)] font-extrabold leading-[1.04] tracking-[-0.032em] text-slate-900 mb-5">
              <motion.span {...slideUp(0.1)} className="block">
                Every call answered.
              </motion.span>
              <motion.span {...slideUp(0.2)} className="block">
                Every order captured.
              </motion.span>
            </h1>

            <motion.p
              {...slideUp(0.35)}
              className="text-[20px] text-slate-600 leading-[1.7] max-w-[460px] mb-9"
            >
              Backbone answers your shop phone, captures order details, handles common questions, and
              sends a clear summary after every call.
            </motion.p>

            <motion.div {...slideUp(0.45)} className="flex flex-wrap gap-2.5 mb-11">
              <motion.a
                href={PHONE_HREF}
                whileHover={{ scale: 1.03, boxShadow: "0 0 0 4px rgba(99,102,241,0.25)", transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-[15px] font-semibold rounded-full px-7 py-3.5 transition-colors"
              >
                <PhoneIcon />
                Give us a call
              </motion.a>
              <motion.a
                href={EMAIL_HREF}
                whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                className="inline-flex items-center text-[15px] font-medium text-slate-900 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-full px-7 py-3.5 transition-all"
              >
                Request a callback
              </motion.a>
            </motion.div>

            <motion.div {...slideUp(0.55)} className="flex flex-wrap gap-6">
              {["Answers in 2 rings", "24/7 availability", "No lock-in contract"].map((item) => (
                <span key={item} className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
                  <span
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#06B6D4" }}
                  >
                    <CyanCheckIcon />
                  </span>
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: iMessage widget + dots + summary */}
          <motion.div {...slideUp(0.2)} className="hidden lg:block">
            <div
              className="relative h-[400px] bg-slate-900 rounded-[20px] overflow-hidden"
              style={{ boxShadow: "0 8px 16px rgba(15,23,42,0.06), 0 24px 64px rgba(15,23,42,0.08)" }}
            >
              <div
                className="blob-a absolute rounded-full pointer-events-none"
                style={{
                  width: "65%", height: "65%", top: "-15%", left: "-10%",
                  background: "radial-gradient(circle, rgba(99,102,241,0.65) 0%, transparent 70%)",
                  filter: "blur(55px)",
                }}
              />
              <div
                className="blob-b absolute rounded-full pointer-events-none"
                style={{
                  width: "55%", height: "55%", bottom: "-10%", right: "-5%",
                  background: "radial-gradient(circle, rgba(6,182,212,0.55) 0%, transparent 70%)",
                  filter: "blur(55px)",
                }}
              />
              <div
                className="blob-c absolute rounded-full pointer-events-none"
                style={{
                  width: "40%", height: "40%", top: "35%", left: "35%",
                  background: "radial-gradient(circle, rgba(139,92,246,0.40) 0%, transparent 70%)",
                  filter: "blur(55px)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              <CallTranscript
                ref={transcriptRef}
                onComplete={() => setSummaryVisible(true)}
                onConvChange={handleConvChange}
              />
            </div>

            {/* Scenario dots */}
            <div className="flex items-center justify-center gap-2.5 mt-4 mb-1">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => handleDotClick(i)}
                  aria-label={`Switch to scenario ${i + 1}`}
                  className="w-2 h-2 rounded-full transition-all duration-200 focus:outline-none"
                  style={{
                    background: activeConv === i ? "#6366F1" : "#CBD5E1",
                    transform: activeConv === i ? "scale(1.3)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            {/* Call summary card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={summaryVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.5, ease }}
              className="mx-5 relative z-10 bg-white rounded-xl px-5 py-4 border-l-4 border-cyan-400"
              style={{ boxShadow: "0 4px 6px rgba(15,23,42,0.05), 0 10px 28px rgba(15,23,42,0.08)" }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400 mb-3">
                Call summary, 2 mins ago
              </div>
              <div className="space-y-1">
                {summaryRows.map(({ label, value, highlight }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={summaryVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                    transition={{ duration: 0.3, delay: summaryVisible ? i * 0.1 : 0, ease }}
                    className="text-[12px]"
                  >
                    <span className="text-slate-400">{label}: </span>
                    {highlight ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: "#06B6D4" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                        {value}
                      </span>
                    ) : (
                      <span className="text-slate-700">{value}</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.95 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2.88 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 18.92z" />
    </svg>
  )
}

function CyanCheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5" />
    </svg>
  )
}
