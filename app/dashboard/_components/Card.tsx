import { type ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 ${className}`}
      style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  meta,
  action,
}: {
  title: string
  meta?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
      <div>
        <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
        {meta && <p className="text-[12px] text-slate-400 mt-0.5">{meta}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>
}
