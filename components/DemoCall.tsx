import FadeIn from "@/components/FadeIn"
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/contact"

export default function DemoCall() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-[#0C1410] border-t border-white/[0.06] overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-accent/[0.05] blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-24 text-center w-full">
        <FadeIn>
          <h2 className="font-serif font-bold text-[2.8rem] sm:text-[3.8rem] lg:text-[4.8rem] text-cream mb-5 leading-[1.05] tracking-[-0.02em]">
            Before you scroll,
            <br />
            give us a call.
          </h2>

          <p className="font-sans text-muted text-lg mb-16 max-w-md mx-auto leading-relaxed">
            Questions answered. Availability checked. Bookings taken. Pick up the phone and see what
            your customers will experience.
          </p>

          <a
            href={PHONE_HREF}
            className="inline-flex flex-col items-center gap-6 group"
            aria-label="Call now"
          >
            <span className="font-serif font-bold text-[clamp(3rem,10vw,7.5rem)] text-cream group-hover:text-accent transition-colors tracking-[-0.03em] leading-none tabular-nums">
              {PHONE_DISPLAY}
            </span>

            <span className="inline-flex items-center gap-2.5 bg-accent group-hover:bg-accent-light text-cream font-semibold text-base px-10 py-4 rounded transition-colors pulse-ring">
              <PhoneIcon />
              Call now
            </span>
          </a>

          <p className="font-sans text-muted/40 text-xs mt-14">
            Standard call rates apply.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

function PhoneIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.95 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2.88 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 18.92z" />
    </svg>
  )
}
