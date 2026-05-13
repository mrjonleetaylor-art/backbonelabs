export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF9F5' }}>
      <div className="w-full max-w-[420px] px-6 text-center">
        <div className="text-[22px] font-bold tracking-[-0.02em] text-slate-900 mb-8">
          relay<span className="text-indigo-500">desk</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-8" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
          <h1 className="text-[18px] font-semibold text-slate-900 mb-3">Your account isn&apos;t set up yet</h1>
          <p className="text-[14px] text-slate-500 leading-relaxed mb-6">
            We don&apos;t have a RelayDesk account linked to this email address. If you think this is a mistake, get in touch and we&apos;ll sort it out.
          </p>
          <a
            href="mailto:support@relaydesk.com.au?subject=Dashboard%20access%20request"
            className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white text-[14px] font-semibold rounded-lg px-5 py-2.5 transition-colors"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  )
}
