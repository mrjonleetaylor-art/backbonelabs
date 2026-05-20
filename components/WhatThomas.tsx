"use client"
import { useState } from "react"
import { motion } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

type Item = {
  icon: React.ReactNode
  title: string
  body: string
  sample: string
  violet?: boolean
  span2?: boolean
}

const items: Item[] = [
  {
    icon: <ClipboardIcon />,
    title: "Phone orders",
    body: "Item, quantity, pickup or delivery, date, and contact details - captured every time.",
    sample: "Sarah, mixed bouquet $80, Saturday pickup.",
    violet: true,
    span2: true,
  },
  {
    icon: <TagIcon />,
    title: "Stock questions",
    body: 'Answers questions like "Do you have sunflowers?" based on what you configure.',
    sample: "Yep, we've got sunflowers in this week.",
  },
  {
    icon: <ClockIcon />,
    title: "Opening hours",
    body: 'Always consistent. No more "I thought you closed at 5" confusion.',
    sample: "We're open 'til 5 today, 9 to 4 Saturday.",
  },
  {
    icon: <TruckIcon />,
    title: "Delivery coverage",
    body: "Suburbs you cover, fees, same-day availability - handled cleanly every time.",
    sample: "Yes, we deliver to Caringbah. $15 fee, same-day if ordered before noon.",
  },
  {
    icon: <MessageIcon />,
    title: "Call summaries",
    body: "Name, number, and the reason for the call, every time. Nothing falls through the cracks.",
    sample: "Email sent: 3 calls, 2 orders, 1 enquiry.",
    span2: true,
  },
  {
    icon: <PhoneForwardIcon />,
    title: "Call transfers",
    body: "Set rules to transfer calls you want to take yourself - VIP customers, large orders, whatever you decide.",
    sample: "I'll put you through to Sheena now.",
    violet: true,
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const cardAnim = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

function BentoCard({ item }: { item: Item }) {
  const [hovered, setHovered] = useState(false)

  const isViolet = item.violet
  const bg = isViolet ? "#1E3A5F" : "#ffffff"
  const textPrimary = isViolet ? "text-white" : "text-slate-900"
  const textBody = isViolet ? "text-white/70" : "text-slate-500"
  const iconBg = isViolet ? "bg-white/15" : "bg-[#EEF2F8]"
  const iconColor = isViolet ? "text-white" : "text-[#1E3A5F]"
  const divider = isViolet ? "border-white/20" : "border-slate-100"
  const sampleColor = isViolet ? "text-white/60" : "text-[#1E3A5F]"

  return (
    <motion.div
      variants={cardAnim}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{
        y: -4,
        boxShadow: isViolet
          ? "0 16px 40px rgba(30,58,95,0.35)"
          : "0 12px 32px rgba(15,23,42,0.12)",
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      className={`relative rounded-2xl p-7 h-full flex flex-col border ${item.span2 ? "lg:col-span-2" : ""}`}
      style={{
        background: bg,
        borderColor: isViolet ? "transparent" : "#E2E8F0",
        boxShadow: isViolet
          ? "0 4px 16px rgba(30,58,95,0.2)"
          : "0 1px 3px rgba(15,23,42,0.05)",
        minHeight: item.span2 ? "180px" : "160px",
      }}
    >
      <div className={`w-[38px] h-[38px] ${iconBg} ${iconColor} rounded-lg flex items-center justify-center mb-4 flex-shrink-0`}>
        {item.icon}
      </div>
      <h3 className={`text-[15px] font-semibold ${textPrimary} mb-2 tracking-[-0.01em]`}>
        {item.title}
      </h3>
      <p className={`text-[13px] ${textBody} leading-[1.65] flex-1`}>{item.body}</p>

      {/* Sample line — always visible, full opacity on hover */}
      <div
        className="mt-3 transition-opacity duration-200"
        style={{ opacity: hovered ? 1 : 0.4 }}
      >
        <div className={`border-t ${divider} pt-3`}>
          <p className={`text-[12px] italic ${sampleColor}`}>{item.sample}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function WhatThomas() {
  return (
    <section className="bg-[#FAF9F5] py-24 border-t border-slate-200">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mb-12"
        >
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] text-[#1E3A5F] mb-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Capabilities
          </span>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.025em] text-slate-900 mt-1.5">
            What RelayDesk handles for you
          </h2>
        </motion.div>

        {/* Bento grid: 4 columns, varying spans */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {items.map((item) => (
            <BentoCard key={item.title} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d="M14 2H6a2 2 0 0 0-2 2v16l4-4h10a2 2 0 0 0 2-2V8z" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="13" y2="13" />
    </svg>
  )
}

function PhoneForwardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <polyline points="18 2 22 2 22 6" />
      <line x1="16" y1="8" x2="22" y2="2" />
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.88 2H7a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18.92z" />
    </svg>
  )
}
