import Image from 'next/image'

export default function DashboardPreview() {
  return (
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
  )
}
