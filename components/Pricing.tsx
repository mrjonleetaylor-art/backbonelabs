import FadeIn from "@/components/FadeIn"
import { MONTHLY_PRICE } from "@/lib/constants"
import { PHONE_HREF, EMAIL_HREF } from "@/lib/contact"

const inclusions = [
  "Unlimited calls, answered every time",
  "24/7 availability - evenings, weekends, public holidays",
  "Custom greeting and conversation script",
  "Order-taking with full details captured every call",
  "Call summaries emailed to you after every call",
  "Free onboarding and setup (takes about 30 minutes)",
  "No lock-in - cancel any time with 30 days notice",
]

export default function Pricing() {
  return (
    <section className="bg-[#0C1410] border-t border-white/[0.06] py-24 md:py-32">
      <div className="max-w-xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-accent mb-4">
              Pricing
            </p>
            <h2 className="font-serif font-bold text-3xl md:text-[2.6rem] text-cream tracking-tight">
              Simple pricing. No surprises.
            </h2>
          </div>
          <div className="border border-white/[0.1]">
            <div className="p-8 md:p-10 border-b border-white/[0.08]">
              <div className="flex items-end gap-2 mb-2">
                <span className="font-serif font-bold text-[5rem] text-cream leading-none tracking-tight">${MONTHLY_PRICE}</span>
                <span className="font-sans text-muted text-base mb-3">/month</span>
              </div>
              <p className="font-sans text-muted text-sm">
                Everything included. No setup fees. No per-call charges.
              </p>
            </div>
            <div className="p-8 md:p-10">
              <ul className="space-y-4 mb-8">
                {inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg
                      className="w-4 h-4 text-accent shrink-0 mt-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span className="font-sans text-cream/80 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={PHONE_HREF}
                  className="flex-1 bg-accent hover:bg-accent-light text-cream font-semibold text-sm px-6 py-3.5 rounded transition-colors text-center"
                >
                  Talk to Thomas now
                </a>
                <a
                  href={EMAIL_HREF}
                  className="flex-1 border border-white/15 hover:border-white/30 text-cream font-semibold text-sm px-6 py-3.5 rounded transition-all text-center"
                >
                  Book a demo
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
