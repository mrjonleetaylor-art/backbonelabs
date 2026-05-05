import FadeIn from "@/components/FadeIn"
import { PHONE_HREF, EMAIL_HREF } from "@/lib/contact"

export default function FinalCTA() {
  return (
    <section className="relative bg-secondary border-t border-white/[0.06] py-28 md:py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-accent/[0.05] blur-[100px]" />
      </div>
      <div className="relative max-w-2xl mx-auto px-6 text-center">
        <FadeIn>
          <h2 className="font-serif font-bold text-[2.4rem] md:text-[3.2rem] lg:text-[4rem] text-cream mb-5 leading-[1.05] tracking-[-0.02em]">
            Ready to stop missing orders?
          </h2>
          <p className="font-sans text-muted text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Thomas is live right now. Call him to hear what he can do, or book a time to talk about
            getting him set up for your shop.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={PHONE_HREF}
              className="bg-accent hover:bg-accent-light text-cream font-semibold text-base px-8 py-3.5 rounded transition-colors"
            >
              Talk to Thomas now
            </a>
            <a
              href={EMAIL_HREF}
              className="border border-white/15 hover:border-white/30 hover:bg-white/[0.04] text-cream font-semibold text-base px-8 py-3.5 rounded transition-all"
            >
              Book a demo
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
