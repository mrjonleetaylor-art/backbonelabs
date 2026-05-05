"use client"
import { useState } from "react"
import FadeIn from "@/components/FadeIn"

const faqs = [
  {
    q: "Is Thomas actually an AI?",
    a: "Yes. Thomas uses advanced voice AI to handle calls naturally. Most callers find the conversation indistinguishable from speaking with a human receptionist.",
  },
  {
    q: "What if Thomas doesn't know the answer to something?",
    a: "During onboarding, we train Thomas on everything specific to your shop - products, hours, delivery areas, pricing, and your most common questions. For anything that falls outside that, he takes a clear message and flags it for you.",
  },
  {
    q: "Can I customise what Thomas says?",
    a: "Absolutely. We configure Thomas with your shop name, products, hours, pricing, and FAQs. The setup takes about 30 minutes, and most clients are live within 48 hours.",
  },
  {
    q: "What if I want to take a call myself?",
    a: "You can set rules to transfer calls straight to you - all calls, large orders only, VIP customers, or calls where someone asks to speak to a person. It's flexible.",
  },
  {
    q: "What does $300 a month cover?",
    a: "Everything. Unlimited calls, 24/7 availability, custom setup, call summaries, and ongoing support. No per-call charges, no hidden fees.",
  },
  {
    q: "What happens if I want to cancel?",
    a: "No lock-in. Cancel any time with 30 days notice. We'll help you transition and make sure nothing falls through the cracks.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="bg-primary border-t border-white/[0.06] py-24 md:py-32">
      <div className="max-w-2xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-14">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-accent mb-4">
              FAQ
            </p>
            <h2 className="font-serif font-bold text-3xl md:text-[2.6rem] text-cream tracking-tight">
              Common questions
            </h2>
          </div>
        </FadeIn>
        <div className="border-t border-white/[0.06]">
          {faqs.map((faq, i) => (
            <FadeIn key={faq.q} delay={i * 50}>
              <div className="border-b border-white/[0.06]">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-start justify-between gap-4 py-5 text-left group"
                  aria-expanded={open === i}
                >
                  <span className="font-sans font-medium text-cream group-hover:text-accent transition-colors text-sm leading-snug">
                    {faq.q}
                  </span>
                  <span
                    className={`shrink-0 w-5 h-5 flex items-center justify-center transition-transform duration-200 mt-0.5 text-muted ${
                      open === i ? "rotate-180 text-accent" : ""
                    }`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>
                {open === i && (
                  <p className="font-sans text-muted text-sm pb-5 leading-relaxed -mt-1">
                    {faq.a}
                  </p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
