"use client"

import { useState } from "react"
import { Eyebrow, Switch } from "@/components/brand"

// Avatar colours are the comp's physical voice-chip values.
const VOICES = [
  { id: "warm-female", label: "Warm AU female", initial: "M", color: "#C77D2B" },
  { id: "friendly-male", label: "Friendly AU male", initial: "J", color: "#1B3052" },
  { id: "calm-clear", label: "Calm & clear", initial: "K", color: "#1A8C73" },
]

const PERSONAS = ["Professional", "Warm & friendly", "Brief"]

const RULES = [
  "Transfer large orders straight to my mobile",
  "Mention this week's specials",
]

const REFUND = "\"No worries at all, I'll take your details and get Sheena to call you back today to sort it out.\""

const WAVE_BARS = [6, 11, 8, 13, 7]

export default function Control() {
  const [rules, setRules] = useState([true, true])
  const [voice, setVoice] = useState(0)
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
              You pick the voice, the personality, what it says, and which calls come straight to you.
              We set it up with you, then it&apos;s yours to tune. Change it any time, no developer, no
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
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink/55">Voice</p>
            <div className="mb-6 flex flex-wrap gap-2">
              {VOICES.map((v, i) => {
                const selected = voice === i
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVoice(i)}
                    aria-pressed={selected}
                    className={[
                      "flex items-center gap-2.5 rounded-full border py-2 pl-2.5 pr-3.5 text-[13px] font-medium text-ink transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                      selected
                        ? "border-gold bg-[rgba(245,165,36,0.08)] shadow-[0_0_0_2px_rgba(245,165,36,0.18)]"
                        : "border-hairline bg-white hover:border-[rgba(10,20,34,0.2)]",
                    ].join(" ")}
                  >
                    <span
                      className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-semibold text-white"
                      style={{ background: v.color }}
                    >
                      {v.initial}
                    </span>
                    {v.label}
                    {selected && (
                      <span className="ml-0.5 flex h-3.5 items-end gap-[2px]" aria-hidden="true">
                        {WAVE_BARS.map((h, k) => (
                          <i key={k} className="w-[2px] rounded-[2px] bg-gold" style={{ height: h }} />
                        ))}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

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
