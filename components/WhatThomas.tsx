import FadeIn from "@/components/FadeIn"

const items = [
  {
    icon: <ClipboardIcon />,
    title: "Taking phone orders",
    body: "Item, quantity, pickup or delivery, date, and contact details - captured every time.",
  },
  {
    icon: <TagIcon />,
    title: "Stock & availability",
    body: 'Answers questions like "Do you have sunflowers?" based on what you tell him.',
  },
  {
    icon: <ClockIcon />,
    title: "Hours & location",
    body: 'Always consistent. No more "I thought you closed at 5" confusion.',
  },
  {
    icon: <TruckIcon />,
    title: "Delivery enquiries",
    body: "Suburbs you cover, fees, same-day availability - handled cleanly every time.",
  },
  {
    icon: <MessageIcon />,
    title: "Taking messages",
    body: "Name, number, and the reason for the call, every time. Nothing falls through the cracks.",
  },
  {
    icon: <PhoneForwardIcon />,
    title: "Transferring calls",
    body: "Set rules to transfer calls you want to take yourself - VIP customers, large orders, whatever you decide.",
  },
]

export default function WhatThomas() {
  return (
    <section className="bg-primary border-t border-white/[0.06] py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-accent mb-4">
              Capabilities
            </p>
            <h2 className="font-serif font-bold text-3xl md:text-[2.6rem] text-cream tracking-tight">
              What Thomas handles for you
            </h2>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06]">
          {items.map((item, i) => (
            <FadeIn key={item.title} delay={i * 70}>
              <div className="bg-primary p-7 hover:bg-secondary/60 transition-colors h-full">
                <div className="text-muted mb-4 w-5 h-5">
                  {item.icon}
                </div>
                <h3 className="font-sans font-semibold text-cream mb-2.5 text-[0.95rem]">{item.title}</h3>
                <p className="font-sans text-muted text-sm leading-relaxed">{item.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16l4-4h10a2 2 0 0 0 2-2V8z" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="13" y2="13" />
    </svg>
  )
}

function PhoneForwardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="18 2 22 2 22 6" />
      <line x1="16" y1="8" x2="22" y2="2" />
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.88 2H7a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18.92z" />
    </svg>
  )
}
