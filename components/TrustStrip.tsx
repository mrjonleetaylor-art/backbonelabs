// Thin band of corrected, true claims under the hero. The lead word(s) are
// bold ink, the rest muted. Copy is verbatim from the comp.
const CLAIMS = [
  { lead: "Australian", rest: " business" },
  { lead: "Concurrent", rest: " calls, no queue" },
  { lead: "Backup", rest: " answers if anything fails" },
  { lead: "From $99", rest: "/month, no lock-in" },
]

export default function TrustStrip() {
  return (
    <section className="border-y border-hairline bg-paper-2 py-[22px]">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-center gap-x-9 gap-y-3 px-7 text-[13px] font-medium text-ink/60">
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
