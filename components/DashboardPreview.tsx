"use client"
import Image from 'next/image'
import { motion } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1] as const

const benefits = [
  {
    title: "Outstanding items",
    desc: "Callbacks and orders waiting on you, surfaced at the top.",
  },
  {
    title: "Full call activity",
    desc: "Every call logged with outcome, duration, and caller detail.",
  },
  {
    title: "Weekly summary",
    desc: "A digest emailed to you at the end of each week.",
  },
]

export default function DashboardPreview() {
  return (
    <section className="bg-white py-24 border-t border-slate-200">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
            >
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] text-[#1E3A5F] mb-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Your dashboard
              </span>
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.025em] text-slate-900 mt-1.5">
                See exactly what happened while you were busy
              </h2>
              <p className="text-[17px] text-slate-500 leading-[1.7] mt-4 max-w-[460px]">
                Every call your agent handles shows up here — orders taken, callbacks due, and a full activity log. Nothing falls through the cracks.
              </p>
            </motion.div>

            <div className="mt-8 space-y-4">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease, delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span
                    className="mt-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#1E3A5F" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </span>
                  <div>
                    <span className="text-[14px] font-medium text-slate-700">{b.title}</span>
                    <span className="text-[14px] text-slate-500"> — {b.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: screenshot with browser chrome */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl">
            {/* Browser chrome */}
            <div className="bg-slate-100 border-b border-slate-200 h-10 px-4 flex items-center gap-1.5 flex-shrink-0">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <Image
              src="/dashboard/preview/dashboard-screenshot.png"
              alt="RelayDesk dashboard showing call activity, outstanding orders, and agent performance"
              width={2962}
              height={2042}
              className="w-full h-auto block"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
