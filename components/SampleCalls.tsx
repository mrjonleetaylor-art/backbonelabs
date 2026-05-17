"use client"
import { useState } from "react"
import { motion } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

type Sample = {
  label: string
  description: string
  src: string
}

const samples: Sample[] = [
  {
    label: "After-hours order",
    description: "Customer calls at 7pm to place a next-day delivery order.",
    src: "/audio/sample-after-hours.mp3",
  },
  {
    label: "Same-day delivery",
    description: "Caller wants an arrangement delivered today for an anniversary.",
    src: "/audio/sample-same-day.mp3",
  },
  {
    label: "Wedding enquiry",
    description: "Bride-to-be asking about availability and pricing for arrangements.",
    src: "/audio/sample-wedding.mp3",
  },
  {
    label: "Delivery area question",
    description: "Caller checking whether their suburb is in the delivery zone.",
    src: "/audio/sample-delivery-area.mp3",
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const cardAnim = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

function SampleCard({ sample }: { sample: Sample }) {
  const [errored, setErrored] = useState(false)

  return (
    <motion.div
      variants={cardAnim}
      className="bg-white rounded-xl border border-slate-200 p-6"
      style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.06)" }}
    >
      <p className="text-[15px] font-semibold text-slate-900 tracking-[-0.01em]">
        {sample.label}
      </p>
      <p className="text-[13px] text-slate-500 leading-[1.6] mt-1">
        {sample.description}
      </p>
      {errored ? (
        <p className="text-[12px] text-slate-400 italic mt-3">Recording available soon.</p>
      ) : (
        <audio
          controls
          src={sample.src}
          className="w-full mt-3 accent-indigo-500"
          onError={() => setErrored(true)}
        />
      )}
    </motion.div>
  )
}

export default function SampleCalls() {
  return (
    <section className="bg-slate-50 py-24 border-t border-slate-200">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mb-12"
        >
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] text-indigo-500 mb-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Sample calls
          </span>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.025em] text-slate-900 mt-1.5">
            Hear it for yourself
          </h2>
          <p className="text-[17px] text-slate-500 leading-[1.7] mt-4 max-w-[520px]">
            Real calls handled by RelayDesk. No scripts, no hold music.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {samples.map((sample) => (
            <SampleCard key={sample.src} sample={sample} />
          ))}
        </motion.div>

      </div>
    </section>
  )
}
