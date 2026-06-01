// Thin band of corrected, true claims under the hero. Lead word(s) bold ink.
const CLAIMS = [
  { lead: "Australian", rest: " business" },
  { lead: "Concurrent", rest: " calls, no queue" },
  { lead: "Backup", rest: " answers if anything fails" },
  { lead: "From $99", rest: "/month, no lock-in" },
]

export default function TrustStrip() {
  return (
    <section className="border-y border-hairline bg-paper-2 py-[22px]">
      {/* Mobile: 2-column grid — no centred orphans. sm+: flex row. */}
      <div className="mx-auto grid max-w-[1160px] grid-cols-2 gap-x-6 gap-y-3 px-7 text-[13px] font-medium text-ink/60 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-9 sm:gap-y-3">
        {CLAIMS.map((c) => (
          <span key={c.lead}>
            <b className="font-semibold text-ink">{c.lead}</b>
            {c.rest}
          </span>
        ))}
      </div>
    </section>
  )
}
