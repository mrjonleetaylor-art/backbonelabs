"use client"
import { motion } from "framer-motion"
import { PHONE_DISPLAY, PHONE_HREF, EMAIL_HREF } from "@/lib/contact"

const ease = [0.22, 1, 0.36, 1] as const

export default function DemoCall() {
  return (
    <section
      className="relative overflow-hidden bg-[#1E3A5F]"
      style={{ padding: "100px 0" }}
    >
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center">

          {/* Left: headline + number CTA */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
              className="text-[13px] font-semibold uppercase tracking-[0.09em] text-white/70 mb-4"
            >
              Before you scroll, give us a call
            </motion.p>

            <motion.a
              href={PHONE_HREF}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ opacity: 0.85, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease, delay: 0.08 }}
              className="block font-extrabold text-white leading-none tracking-[-0.035em] mb-3"
              style={{ fontSize: "clamp(44px, 7vw, 72px)" }}
            >
              {PHONE_DISPLAY}
            </motion.a>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: 0.14 }}
              className="text-[14px] text-white/60 mb-10"
            >
              Tap to call &middot; Available 24/7
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: 0.2 }}
            >
              <motion.a
                href={EMAIL_HREF}
                whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
                className="text-[14px] font-medium text-white/70 hover:text-white hover:underline underline-offset-2 transition-colors"
              >
                Or request a callback
              </motion.a>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
