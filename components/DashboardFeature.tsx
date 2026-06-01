import { Eyebrow } from "@/components/brand"

// Browser-chrome traffic lights and frame are the comp's physical dark values.
export default function DashboardFeature() {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-24 text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-[30%] h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[20px]"
          style={{
            background:
              "radial-gradient(circle, rgba(245,165,36,0.20), rgba(45,194,160,0.10) 38%, transparent 60%)",
          }}
        />
        <div className="grain" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1160px] px-7">
        <Eyebrow tone="onDark">Your dashboard</Eyebrow>
        <h2 className="mt-3.5 max-w-[680px] font-display text-[clamp(30px,3.6vw,46px)] font-bold leading-[1.05] tracking-[-0.03em] text-white">
          Every call, the moment it happens.
        </h2>
        <p className="mt-3.5 max-w-[540px] text-[17px] leading-[1.6] text-white/60">
          Open your phone between jobs and see exactly what came in: who called, what they wanted,
          what&apos;s been captured, and what needs you.
        </p>

        <div className="relative mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0E1B2E] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-[7px] border-b border-white/10 bg-[#0B1626] px-4 py-[11px]">
            <span className="h-[11px] w-[11px] rounded-full bg-[#FF5F57]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#FEBC2E]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#28C840]" />
            <span className="ml-3.5 font-mono text-[12px] text-white/40">app.relaydesk.com.au</span>
          </div>
          {/* Plain img on purpose: the next/image optimizer endpoint 401s on a
              deployment-protection-gated preview, so the screenshot would not
              render during review. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dashboard/preview/dashboard-screenshot.png"
            alt="RelayDesk dashboard showing calls answered, orders captured, upcoming appointments and recent calls"
            className="block h-auto w-full"
          />
        </div>
      </div>
    </section>
  )
}
