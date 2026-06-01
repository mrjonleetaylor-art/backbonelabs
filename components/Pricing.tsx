"use client"
import { motion } from "framer-motion"
import { PHONE_HREF } from "@/lib/contact"
import { OVERFLOW_PRICE, RECEPTIONIST_PRICE, OPERATOR_PRICE } from "@/lib/constants"
import { Eyebrow } from "@/components/brand"

const ease = [0.22, 1, 0.36, 1] as const

type Tier = {
  name: string
  price: number
  tagline: string
  features: string[]
  callsIncluded: string
  goodFor: string
  badge?: string
  variant: "light" | "gold" | "dark"
}

const tiers: Tier[] = [
  {
    name: "Overflow",
    price: OVERFLOW_PRICE,
    tagline: "Better than voicemail. Smarter than missing it.",
    features: [
      "Answers calls you miss - RelayDesk is your safety net",
      "Takes orders and captures enquiry details",
      "Payment links sent via SMS",
      "Call summary after every call",
      "Transfers back to you on request",
      "Cancel any month",
    ],
    callsIncluded: "150 calls/month included",
    goodFor: "For when you miss a few calls a week.",
    variant: "light",
  },
  {
    name: "Receptionist",
    price: RECEPTIONIST_PRICE,
    tagline: "Your front desk. Always staffed.",
    features: [
      "Answers all inbound calls 24/7",
      "Takes orders, handles common enquiries",
      "Payment links sent via SMS",
      "Priority routing for urgent calls",
      "Call summary after every call",
      "Transfers to you when needed",
      "Cancel any month",
    ],
    callsIncluded: "1,000 calls/month included",
    goodFor: "For when every call counts.",
    badge: "Most popular",
    variant: "gold",
  },
  {
    name: "Operator",
    price: OPERATOR_PRICE,
    tagline: "Your customer communications, handled end to end.",
    features: [
      "Everything in Receptionist",
      "Automated follow-up emails after every call",
      "SMS reminders for upcoming orders",
      "Outbound calls for confirmations and callbacks",
      "Multilingual support",
      "Custom automation workflows",
      "Dedicated setup and onboarding support",
      "Cancel any month",
    ],
    callsIncluded: "10,000 calls/month included",
    goodFor: "For teams that are scaling.",
    variant: "dark",
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const cardItem = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

function CheckIcon({ variant }: { variant: "light" | "gold" | "dark" }) {
  const color = variant === "dark" ? "rgba(255,255,255,0.7)" : "var(--color-ink)"
  return (
    <svg
      className="w-[14px] h-[14px] flex-shrink-0 mt-[2px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function PricingCard({ tier }: { tier: Tier }) {
  const isLight = tier.variant === "light"
  const isGold = tier.variant === "gold"
  const isDark = tier.variant === "dark"

  // Middle card: warm gold-cream surface with gold border/glow.
  // Dark card: ink surface.
  const bg = isDark ? "var(--color-ink)" : isGold ? "#FDF6E4" : "#ffffff"
  const textPrimary = isDark ? "text-white" : "text-ink"
  const textMuted = isDark ? "text-white/60" : "text-ink/60"
  const textFeature = isDark ? "text-white/75" : "text-ink/80"
  const divider = isDark ? "border-white/[0.12]" : isGold ? "border-[rgba(245,165,36,0.25)]" : "border-hairline"
  const goodForColor = isDark ? "text-white/55" : "text-ink/55"
  const callsColor = isDark ? "text-white/45" : "text-ink/40"
  const borderStyle = isDark
    ? "none"
    : isGold
      ? "1px solid rgba(245,165,36,0.35)"
      : "1px solid var(--color-hairline)"
  const boxShadow = isGold
    ? "0 16px 48px rgba(245,165,36,0.18), 0 4px_12px rgba(245,165,36,0.10)"
    : isLight
      ? "0 1px 3px rgba(10,20,34,0.06), 0 4px 16px rgba(10,20,34,0.06)"
      : "0 4px 24px rgba(0,0,0,0.35)"

  return (
    <motion.div
      variants={cardItem}
      whileHover={{
        y: isGold ? -16 : -5,
        ...(isGold ? { boxShadow: "0 20px 56px rgba(245,165,36,0.22)" } : {}),
        transition: { type: "spring", stiffness: 280, damping: 22 },
      }}
      className={`flex flex-col rounded-2xl h-full ${isGold ? "lg:translate-y-[-12px] lg:scale-[1.03]" : ""}`}
      style={{ background: bg, border: borderStyle, boxShadow }}
    >
      {/* Header */}
      <div className="p-7 pb-5">
        {tier.badge && (
          <span className="inline-flex items-center text-[11px] font-semibold rounded-full px-3 py-1 tracking-[0.04em] mb-4 bg-ink text-white">
            {tier.badge}
          </span>
        )}
        <div className={`font-display text-[20px] font-bold mb-1 ${textPrimary}`}>{tier.name}</div>
        <p className={`text-[13px] leading-[1.5] mb-6 ${textMuted}`}>{tier.tagline}</p>
        <div className="flex items-baseline gap-1 mb-1">
          <span className={`font-display text-[52px] font-extrabold leading-none tracking-[-0.04em] ${textPrimary}`}>
            ${tier.price}
          </span>
          <span className={`text-[14px] ${textMuted}`}>/month</span>
        </div>
        <p className={`text-[12px] italic leading-[1.6] mt-3 ${goodForColor}`}>{tier.goodFor}</p>
      </div>

      {/* Features */}
      <div className={`px-7 py-5 border-t ${divider} flex-1`}>
        <ul className="space-y-3">
          {tier.features.map((f) => (
            <li key={f} className={`flex items-start gap-2.5 text-[13px] leading-[1.5] ${textFeature}`}>
              <CheckIcon variant={tier.variant} />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className={`px-7 pb-7 pt-5 border-t ${divider}`}>
        <p className={`text-[11.5px] mb-4 ${callsColor}`}>{tier.callsIncluded} - $1 per additional call</p>
        <motion.a
          href={PHONE_HREF}
          whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
          className={`block w-full text-center text-[14px] font-semibold rounded-full py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            isDark
              ? "bg-white/[0.15] hover:bg-white/[0.25] text-white border border-white/[0.2] focus-visible:ring-white focus-visible:ring-offset-ink"
              : "bg-ink hover:bg-ink-3 text-white focus-visible:ring-ink focus-visible:ring-offset-white"
          }`}
        >
          Give us a call
        </motion.a>
      </div>
    </motion.div>
  )
}

export default function Pricing() {
  return (
    <section id="pricing" className="bg-paper-2 py-24 border-t border-hairline">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mb-14"
        >
          <Eyebrow className="mb-3.5">Pricing</Eyebrow>
          <h2 className="font-display text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.025em] text-ink mt-1.5">
            Simple pricing. Real outcomes.
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start lg:items-end"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {tiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease, delay: 0.4 }}
          className="text-[13px] text-ink/45 italic mt-10"
        >
          Refer another business owner to RelayDesk. If they sign up, you both get a free month.
        </motion.p>

      </div>
    </section>
  )
}
