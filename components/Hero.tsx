import { PHONE_HREF, EMAIL_HREF } from "@/lib/contact"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-[#0C1410] overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-accent/[0.06] blur-[120px]" />
      </div>

      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          opacity: 0.035,
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 pt-36 pb-28 text-center">
        <div className="inline-flex items-center gap-2 border border-white/[0.1] rounded-full px-4 py-1.5 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-accent dot-breathe" />
          <span className="text-[11px] font-sans font-medium uppercase tracking-[0.14em] text-muted">
            AI Phone Agent · Built for Florists
          </span>
        </div>

        <h1 className="font-serif font-bold text-[3.2rem] sm:text-[4.5rem] lg:text-[6rem] xl:text-[7rem] text-cream mb-7 leading-[1.0] tracking-[-0.02em]">
          Every call answered.
          <br />
          Every order captured.
        </h1>

        <p className="font-sans text-lg md:text-xl text-muted max-w-xl mx-auto mb-12 leading-relaxed">
          Thomas Anderson is your AI phone agent. He picks up every call to your florist shop,
          takes orders, and handles enquiries - 24 hours a day, 7 days a week.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
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

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {["Answers in 2 rings", "24/7 availability", "No lock-in contract"].map((item) => (
            <span key={item} className="flex items-center gap-2 text-muted/70 text-sm">
              <span className="w-1 h-1 rounded-full bg-accent/70" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
