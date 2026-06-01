"use client"

import { useState } from "react"
import { Eyebrow, Switch } from "@/components/brand"

const PERSONAS = ["Professional", "Warm & friendly", "Brief"]

const RULES = [
  "Transfer large orders straight to my mobile",
  "Mention this week's specials",
]

const REFUND = "\"No worries at all, I'll take your details and get Sheena to call you back today to sort it out.\""

export default function Control() {
  const [rules, setRules] = useState([true, true])
  const [persona, setPersona] = useState(1)

  const toggleRule = (i: number) => setRules((r) => r.map((v, j) => (j === i ? !v : v)))

  return (
    <section className="relative overflow-hidden border-t border-hairline bg-paper py-[90px]">
      <div className="mx-auto w-full max-w-[1160px] px-7">
        <div className="grid grid-cols-1 items-center gap-9 md:grid-cols-2 lg:gap-12">
          {/* Left: copy + rule toggles */}
          <div>
            <Eyebrow>Your business, your rules</Eyebrow>
            <h2 className="mt-3.5 max-w-[680px] font-display text-[clamp(30px,3.6vw,46px)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
              It answers the way you&apos;d answer.
            </h2>
            <p className="mt-3.5 max-w-[540px] text-[17px] leading-[1.6] text-ink/60">
              You set the personality, what it says, and which calls come straight to you.
              We configure it with you, then it&apos;s yours to tune. Change it any time, no developer, no
              waiting.
            </p>

            <div className="mt-6 flex max-w-[420px] flex-col">
              {RULES.map((label, i) => (
                <div key={label} className="flex items-center gap-3.5 border-t border-hairline py-3.5 text-[13.5px] text-ink">
                  <Switch checked={rules[i]} onChange={() => toggleRule(i)} label={label} />
                  <span className="flex-1">{label}</span>
                  <span className="ml-auto min-w-[34px] text-right text-[11.5px] font-semibold text-ink/55">
                    {rules[i] ? "On" : "Off"}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-3.5 border-t border-hairline py-3.5 text-[13.5px] text-ink/50">
                <Switch checked={false} disabled label="Take card payments over the phone (coming soon)" />
                <span className="flex-1">Take card payments over the phone</span>
                <span className="ml-auto min-w-[34px] text-right text-[11.5px] font-semibold text-ink/55">
                  Soon
                </span>
              </div>
            </div>
          </div>

          {/* Right: settings panel */}
          <div className="rounded-[20px] border border-hairline bg-white p-6 shadow-[0_1px_2px_rgba(10,20,34,0.04),0_26px_54px_-26px_rgba(10,20,34,0.26)]">
            <div className="mb-5">
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink/55">Personality</p>
              <div className="flex rounded-[10px] border border-hairline bg-paper p-[3px]">
                {PERSONAS.map((p, i) => {
                  const on = persona === i
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPersona(i)}
                      aria-pressed={on}
                      className={[
                        "flex-1 rounded-[7px] py-[7px] text-[12.5px] font-medium transition-all",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1 focus-visible:ring-offset-paper",
                        on ? "bg-white text-ink shadow-[0_1px_3px_rgba(10,20,34,0.12)]" : "text-ink/55",
                      ].join(" ")}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>

            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink/55">
              When someone asks for a refund
            </p>
            <div className="rounded-[10px] border border-hairline bg-paper px-3.5 py-3 text-[13px] leading-[1.5] text-ink">
              {REFUND}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
