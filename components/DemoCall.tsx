"use client"
import { PHONE_DISPLAY, PHONE_HREF, EMAIL_HREF } from "@/lib/contact"

const QUESTIONS = [
  "How does setup work?",
  "Can I keep my existing number?",
  "Just overflow, or all calls?",
]

export default function DemoCall() {
  return (
    <section className="border-b border-hairline bg-paper-2 py-20">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: headline + CTA */}
          <div>
            <h2
              className="font-display font-bold leading-[1.1] tracking-[-0.025em] text-ink mb-4"
              style={{ fontSize: "clamp(32px,4vw,48px)" }}
            >
              Before you scroll, give us a call.
            </h2>
            <p className="text-ink/60 text-[17px] leading-[1.65] mb-8 max-w-[440px]">
              Call now. Get your questions answered, see how it works, and book a
              setup call, all in one conversation.
            </p>
            <a
              href={PHONE_HREF}
              className="bg-ink hover:bg-ink-3 text-white font-bold text-[17px] rounded-full px-8 py-4 inline-flex items-center gap-2.5 transition-colors shadow-[0_1px_2px_rgba(10,20,34,0.4),0_10px_24px_-10px_rgba(10,20,34,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2"
            >
              <PhoneIcon />
              Call now: {PHONE_DISPLAY}
            </a>
            <div className="mt-4">
              <a
                href={EMAIL_HREF}
                className="text-ink/45 hover:text-ink text-[14px] underline-offset-2 hover:underline transition-colors"
              >
                Or request a callback
              </a>
            </div>
            <p className="text-ink/40 text-[13px] mt-1">Available 24/7</p>
          </div>

          {/* Right: question pills — desktop only */}
          <div className="hidden lg:block">
            <p className="text-ink/45 text-[11px] font-semibold uppercase tracking-[0.08em] mb-4">
              Common questions on the call
            </p>
            <div className="flex flex-col gap-3">
              {QUESTIONS.map((q) => (
                <span
                  key={q}
                  className="inline-block bg-white/65 text-ink text-[14px] font-medium rounded-full px-5 py-2.5 border border-hairline shadow-[0_1px_2px_rgba(10,20,34,0.04)]"
                >
                  {q}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.95 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2.88 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 18.92z" />
    </svg>
  )
}
