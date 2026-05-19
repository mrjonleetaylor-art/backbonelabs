import Image from 'next/image'

export default function DashboardPreview() {
  return (
    <section className="bg-slate-50 py-20 border-t border-slate-100">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12">

        <div className="mb-10">
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] text-indigo-500 mb-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Dashboard
          </span>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.1] tracking-[-0.025em] text-slate-900 mt-1.5">
            Everything in one place
          </h2>
          <p className="text-[17px] text-slate-500 leading-[1.7] mt-4 max-w-[480px]">
            Every call your agent handles shows up here — orders, callbacks, outcomes, and a full activity log. Nothing falls through the cracks.
          </p>
        </div>

        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
          <Image
            src="/dashboard/preview/dashboard-screenshot.png"
            alt="RelayDesk dashboard showing call activity, outstanding orders, and agent performance"
            width={2962}
            height={2042}
            className="w-full h-auto"
            priority
          />
        </div>

      </div>
    </section>
  )
}
