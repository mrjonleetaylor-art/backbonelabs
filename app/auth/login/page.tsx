import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'
import { createClient } from '@/lib/supabase/server'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; message?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const params = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF9F5' }}>
      <div className="w-full max-w-[400px] px-6">
        <div className="mb-8 text-center">
          <div className="text-[22px] font-bold tracking-[-0.02em] text-slate-900 mb-1">
            relay<span className="text-[#1E3A5F]">desk</span>
          </div>
          <p className="text-[14px] text-slate-500">Sign in to your dashboard</p>
        </div>
        <LoginForm next={params.next} />
        {params.message && (
          <p className="mt-4 text-center text-[13px] text-red-500">{params.message}</p>
        )}
      </div>
    </div>
  )
}
