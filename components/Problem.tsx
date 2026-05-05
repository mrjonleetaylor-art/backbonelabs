import FadeIn from "@/components/FadeIn"

const stats = [
  {
    value: "62%",
    label: "of calls to small businesses go unanswered during peak hours",
  },
  {
    value: "$85",
    label: "average value of a floral order - every missed call costs you this",
  },
  {
    value: "$0",
    label: "what you earn from a call you don't answer",
  },
]

export default function Problem() {
  return (
    <section className="bg-secondary border-t border-white/[0.06] py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="font-serif font-bold text-[2.2rem] md:text-[3rem] lg:text-[3.8rem] text-cream mb-5 tracking-[-0.02em]">
              Every missed call is a missed order.
            </h2>
            <p className="font-sans text-muted text-lg max-w-xl mx-auto leading-relaxed">
              You&apos;re busy making arrangements, dealing with suppliers, running the floor. You
              can&apos;t always answer. But every unanswered call is a customer who went elsewhere.
            </p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06]">
          {stats.map((stat, i) => (
            <FadeIn key={stat.value} delay={i * 100}>
              <div className="bg-secondary p-10 text-center h-full">
                <p className="font-serif font-bold text-[4rem] md:text-[5rem] text-accent mb-4 leading-none tracking-tight">
                  {stat.value}
                </p>
                <p className="font-sans text-muted text-sm leading-relaxed max-w-[200px] mx-auto">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
