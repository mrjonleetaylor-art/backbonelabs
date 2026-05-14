"use client"
import Image from "next/image"
import { motion } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

const callNotes = [
  {
    quote: "Can you do same-day delivery to Menai before 3?",
    detail: "Delivery suburb, timing, recipient details, and card message captured.",
  },
  {
    quote: "I need something around $120, soft colours, for tomorrow.",
    detail: "Budget, style, pickup time, and contact number sent straight to the shop.",
  },
  {
    quote: "Do you still have sunflowers in today?",
    detail: "Stock questions answered using the details you configure during setup.",
  },
]

const ownerNotes = [
  { caption: "Hands busy at the bench", objectPosition: "20% center" },
  { caption: "Phone answered in two rings", objectPosition: "50% center" },
  { caption: "Order summary in your inbox", objectPosition: "80% center" },
]

export default function LocalBusinessProof() {
  return (
    <section className="bg-white py-24 border-t border-slate-200 overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease }}
          >
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] text-indigo-500 mb-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Built for the shop floor
            </span>
            <h2 className="text-[clamp(30px,3.6vw,48px)] font-bold leading-[1.08] tracking-[-0.028em] text-slate-900 mt-1.5 mb-5 max-w-[560px]">
              For the moments when the phone rings and both hands are full.
            </h2>
            <p className="text-[17px] text-slate-500 leading-[1.7] max-w-[500px] mb-8">
              RelayDesk is built around the everyday rhythm of small businesses: serving the customer
              in front of you, finishing the order on the bench, and still making sure the next call is handled.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ownerNotes.map((note, i) => (
                <motion.div
                  key={note.caption}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease, delay: 0.08 + i * 0.06 }}
                  className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden"
                >
                  <div className="relative aspect-[3/2]">
                    <Image
                      src="/florist-counter-work.jpg"
                      alt={note.caption}
                      fill
                      className="object-cover"
                      style={{ objectPosition: note.objectPosition }}
                      sizes="(min-width: 1024px) 200px, 50vw"
                    />
                  </div>
                  <p className="text-[13px] font-semibold text-slate-700 leading-[1.45] px-4 py-3">{note.caption}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.08 }}
            className="relative"
          >
            <div className="relative aspect-[1.12/1] rounded-2xl overflow-hidden shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
              <Image
                src="/florist-counter-work.jpg"
                alt="Florist preparing an order beside the shop phone"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 480px, 100vw"
              />
            </div>
            <div className="absolute -bottom-6 -left-4 sm:left-6 bg-white rounded-xl shadow-[0_12px_36px_rgba(15,23,42,0.16)] border border-slate-200 max-w-[310px] p-5">
              <p className="text-[15px] font-bold text-slate-900 leading-[1.45] tracking-[-0.01em]">
                &ldquo;I can keep working on the arrangement and know the call is still being handled properly.&rdquo;
              </p>
              <p className="text-[12px] font-semibold text-cyan-500 mt-3">Owner note, after a busy Saturday</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-20"
        >
          {callNotes.map((item, i) => (
            <div
              key={item.quote}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.05)]"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white mb-5"
                style={{ background: i === 1 ? "#06B6D4" : "#6366F1" }}
              >
                {i + 1}
              </div>
              <p className="text-[18px] font-bold text-slate-900 leading-[1.35] tracking-[-0.015em] mb-3">
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="text-[13px] text-slate-500 leading-[1.65]">{item.detail}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
