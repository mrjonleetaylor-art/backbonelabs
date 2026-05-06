"use client"
import { motion } from "framer-motion"
import { PHONE_DISPLAY, PHONE_HREF, EMAIL_HREF } from "@/lib/contact"

const ease = [0.22, 1, 0.36, 1] as const

const QUESTIONS = [
  "How does setup work?",
  "Can I keep my number?",
  "Just overflow, or all calls?",
]

export default function DemoCall() {
  return (
    <section
      className="relative overflow-hidden bg-indigo-500"
      style={{ padding: "100px 0" }}
    >
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-center">

          {/* Left: headline + CTA */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="font-extrabold text-white leading-[1.06] tracking-[-0.03em] mb-5"
              style={{ fontSize: "clamp(36px, 4.5vw, 58px)" }}
            >
              Before you scroll,
              <br />
              give us a call.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
              className="text-[17px] text-white/80 leading-[1.65] max-w-[400px] mb-10"
            >
              Call now. Get your questions answered, see how it works,
              and book a setup call - all in one conversation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease, delay: 0.2 }}
              className="flex flex-col items-start gap-3"
            >
              <motion.a
                href={PHONE_HREF}
                initial={{ scale: 1 }}
                whileInView={{ scale: [1, 1, 1] }}
                whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-3 bg-white hover:bg-white/90 text-indigo-600 font-semibold rounded-full transition-colors"
                style={{ fontSize: "18px", padding: "18px 40px" }}
              >
                <motion.span
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 0.45, delay: 0.6, ease: "easeOut" }}
                  className="inline-flex"
                >
                  <PhoneIcon />
                </motion.span>
                Call now: {PHONE_DISPLAY}
              </motion.a>

              <motion.a
                href={EMAIL_HREF}
                whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                className="text-[14px] font-medium text-white/80 hover:text-white hover:underline underline-offset-2 transition-colors ml-1"
              >
                Or request a callback
              </motion.a>

              <p className="text-[13px] text-white/70 ml-1">Available 24/7</p>
            </motion.div>
          </div>

          {/* Right: sample question bubbles */}
          <div className="hidden lg:flex flex-col gap-3 items-end">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/60 mb-1 self-end">
              Common questions on the call
            </p>
            {QUESTIONS.map((q, i) => (
              <motion.div
                key={q}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease }}
                className="rounded-2xl rounded-tr-sm px-4 py-3 text-[14px] text-white/90 max-w-[260px] text-right"
                style={{ background: "#312E81" }}
              >
                {q}
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.95 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2.88 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 18.92z" />
    </svg>
  )
}
