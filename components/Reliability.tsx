import type { ReactNode } from "react"
import { Eyebrow } from "@/components/brand"

type Tone = "gold" | "signal" | "ink"

// Icon tints are the comp's physical values (deepened gold/signal for contrast).
const toneClass: Record<Tone, string> = {
  gold: "bg-[rgba(245,165,36,0.14)] text-[#B5740B]",
  signal: "bg-[rgba(45,194,160,0.14)] text-[#1A8C73]",
  ink: "bg-[rgba(10,20,34,0.07)] text-ink",
}

function ShieldCheck() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 4v5c0 4.4-3 7.6-8 9-5-1.4-8-4.6-8-9V7z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function GlobeCheck() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9" />
      <path d="M3 12a9 9 0 0 0 9 9 9 9 0 0 0 9-9" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  )
}

function SearchClock() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
      <path d="M11 8v3l2 2" />
    </svg>
  )
}

const CARDS: { icon: ReactNode; tone: Tone; title: string; body: string }[] = [
  {
    icon: <ShieldCheck />,
    tone: "gold",
    title: "Ready for the hard calls",
    body: "Thick accents, half-sentences, trick questions, \"are you a robot?\" — your agent handles all of it confidently before a single real customer dials.",
  },
  {
    icon: <GlobeCheck />,
    tone: "signal",
    title: "Nothing slips through",
    body: "Every call is answered, captured, and sent to you — orders, enquiries, the lot. Even at your busiest, no call just rings out.",
  },
  {
    icon: <SearchClock />,
    tone: "ink",
    title: "Every call, watched",
    body: "Each call is summarised and checked for drift, so the agent stays on-script as your business changes. We're hands-on for the first 48 hours live.",
  },
]

export default function Reliability() {
  return (
    <section className="relative overflow-hidden border-t border-hairline bg-paper py-[92px]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="glow-gold left-[-140px] top-[-160px] h-[520px] w-[520px] opacity-70" />
        <div className="grain" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1160px] px-7">
        <Eyebrow>Built to not drop the ball</Eyebrow>
        <h2 className="mt-3.5 max-w-[680px] font-display text-[clamp(30px,3.6vw,46px)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
          Your phone is the business. We treat it that way.
        </h2>
        <p className="mt-3.5 max-w-[540px] text-[17px] leading-[1.6] text-ink/60">
          A missed or fumbled call costs you a customer. So before RelayDesk answers for you, it&apos;s
          already handled the calls most agents fall over on.
        </p>

        <div className="mt-11 grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-[18px] border border-hairline bg-white p-6 shadow-[0_1px_2px_rgba(10,20,34,0.04),0_14px_30px_-20px_rgba(10,20,34,0.16)]"
            >
              <div className={`mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-xl ${toneClass[card.tone]}`}>
                {card.icon}
              </div>
              <h4 className="mb-2 font-display text-[18px] font-semibold tracking-[-0.01em] text-ink">
                {card.title}
              </h4>
              <p className="text-[14px] leading-[1.6] text-ink/60">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
