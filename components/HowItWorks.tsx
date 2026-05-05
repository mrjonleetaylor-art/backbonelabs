import FadeIn from "@/components/FadeIn"

const steps = [
  {
    number: "01",
    title: "Customer calls your number",
    body: "Thomas picks up in 2 rings - every time, day or night. Your customers get a professional answer instead of voicemail.",
  },
  {
    number: "02",
    title: "Thomas handles the enquiry",
    body: "He takes orders, answers questions about stock, hours, and delivery, and handles anything that comes up in a natural conversation.",
  },
  {
    number: "03",
    title: "You get the details",
    body: "Every call is logged and summarised. Orders, messages, and anything that needs your attention is emailed to you after each call.",
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-primary border-t border-white/[0.06] py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-20">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-accent mb-4">
              How it works
            </p>
            <h2 className="font-serif font-bold text-3xl md:text-[2.6rem] text-cream tracking-tight">
              Set up once. Thomas handles the rest.
            </h2>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/[0.06]">
          {steps.map((step, i) => (
            <FadeIn key={step.number} delay={i * 130}>
              <div className={`p-10 h-full ${i < steps.length - 1 ? "border-b md:border-b-0 md:border-r border-white/[0.06]" : ""}`}>
                <div className="font-serif font-bold text-[4rem] text-white/[0.06] leading-none mb-8 select-none tabular-nums">
                  {step.number}
                </div>
                <h3 className="font-sans font-semibold text-cream text-base mb-3">{step.title}</h3>
                <p className="font-sans text-muted text-sm leading-relaxed">{step.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
