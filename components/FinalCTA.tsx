"use client"
import { motion } from "framer-motion"
import { PHONE_DISPLAY, PHONE_HREF, EMAIL_HREF } from "@/lib/contact"

const ease = [0.22, 1, 0.36, 1] as const

export default function FinalCTA() {
  return (
    <section className="bg-[#1E3A5F] py-[120px]">
      <div className="max-w-[640px] mx-auto px-6 text-center">

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="font-bold text-white leading-[1.06] tracking-[-0.03em] mb-4"
          style={{ fontSize: "clamp(34px, 4.5vw, 54px)" }}
        >
          Ready to stop missing orders?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="text-[17px] text-white/70 leading-[1.65] mb-8"
        >
          Give us a call now, or request a callback and we&apos;ll walk you through the right setup for your business.
        </motion.p>

        <motion.a
          href={PHONE_HREF}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.18 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
          className="block font-extrabold text-white/90 tabular-nums leading-none tracking-[-0.03em] mb-10"
          style={{ fontSize: "clamp(40px, 7vw, 72px)" }}
        >
          {PHONE_DISPLAY}
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.26 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.a
            href={PHONE_HREF}
            whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
            className="inline-flex items-center justify-center bg-white hover:bg-white/90 text-[#1E3A5F] text-[16px] font-semibold rounded-full py-4 px-[34px] transition-colors"
          >
            Give us a call
          </motion.a>
          <motion.a
            href={EMAIL_HREF}
            whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
            className="inline-flex items-center justify-center border border-white/40 hover:border-white/70 hover:bg-white/[0.08] text-white text-[16px] font-semibold rounded-full py-4 px-[34px] transition-all"
          >
            Request a callback
          </motion.a>
        </motion.div>

      </div>
    </section>
  )
}
