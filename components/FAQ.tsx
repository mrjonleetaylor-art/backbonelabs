"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eyebrow } from "@/components/brand"

const ease = [0.22, 1, 0.36, 1] as const

const faqs = [
  {
    q: "What happens when someone calls?",
    a: "RelayDesk answers in two rings, greets the caller using your shop name, and handles the conversation from there. It takes orders, answers common questions, collects contact details, and sends you a summary after every call. Callers get a natural, helpful experience - and you don't miss a thing.",
  },
  {
    q: "Can you handle multiple calls at the same time?",
    a: "Yes. There is no queue and no engaged tone. RelayDesk handles concurrent calls, so every caller gets answered even during your busiest periods.",
  },
  {
    q: "What happens if you don't know the answer?",
    a: "During setup, we configure RelayDesk with everything specific to your business - products, hours, pricing, delivery areas, and your most common questions. For anything outside that, it takes a clear message and flags it for you to follow up.",
  },
  {
    q: "Can I customise what RelayDesk says?",
    a: "Absolutely. We configure RelayDesk with your shop name, products, hours, pricing, and FAQs. The setup takes about 30 minutes, and most clients are live within 48 hours.",
  },
  {
    q: "Can I keep my existing phone number?",
    a: "Yes. We set up call forwarding on your existing number, so callers dial the same number they always have. Nothing changes on their end.",
  },
  {
    q: "Can RelayDesk take payment?",
    a: "Yes. RelayDesk sends a secure SMS payment link to the caller's phone, processed with 3D Secure authentication. That's the same standard your bank uses for online card transactions. You can take full payment, a deposit, or split payments depending on what suits the order. Funds settle directly to your nominated account.",
  },
  {
    q: "Can calls be transferred to my mobile?",
    a: "Yes. You set the rules - VIP customers, large orders, whatever you decide gets routed straight through to you.",
  },
  {
    q: "How are call recordings and customer details handled?",
    a: "Every call is logged and summarised. Recordings and data are stored securely and accessible only to you.",
  },
  {
    q: "Is my customer data secure?",
    a: "Yes. Call recordings and customer details are stored on encrypted servers in Australia. Only you have access to your data through the dashboard. We do not share it with third parties.",
  },
  {
    q: "What does setup require from me?",
    a: "About an hour of your time. We configure everything - your services, hours, pricing, and call rules. Most businesses are live within a week.",
  },
  {
    q: "How does pricing work?",
    a: "Plans start at $99/month and scale with your call volume. Each plan includes a set number of calls, and extra calls beyond that are charged at $1 per call. No lock-in - cancel any month.",
  },
  {
    q: "What happens if there are connection issues or the server is down?",
    a: "If RelayDesk is unreachable for any reason, calls are automatically re-routed to a voicemail. You will receive a notification and can follow up with the caller directly.",
  },
  {
    q: "What happens if I want to cancel?",
    a: "No lock-in. Cancel any time with 30 days notice. We'll help you transition and make sure nothing falls through the cracks.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-paper py-24 border-t border-hairline">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-11"
        >
          <Eyebrow className="mb-3.5">FAQ</Eyebrow>
          <h2 className="font-display text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.025em] text-ink mt-1.5">
            Common questions
          </h2>
        </motion.div>

        <div className="max-w-[700px]">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease, delay: Math.min(i * 0.04, 0.2) }}
            >
              <div
                className={`border-b border-hairline rounded-lg px-4 transition-colors duration-200 ${
                  open === i ? "bg-ink/[0.03]" : "bg-transparent"
                }`}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-[19px] text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-inset rounded"
                  aria-expanded={open === i}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span className="text-[17px] font-semibold text-ink group-hover:text-gold transition-colors tracking-[-0.01em]">
                    {faq.q}
                  </span>
                  <motion.svg
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`flex-shrink-0 w-5 h-5 transition-colors ${open === i ? "text-gold" : "text-ink/35"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </motion.svg>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      key="answer"
                      id={`faq-answer-${i}`}
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="text-[15px] text-ink/60 leading-[1.7] pb-[18px] -mt-1"
                      >
                        {faq.a}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
