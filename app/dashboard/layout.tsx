import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Sidebar from './_components/Sidebar'

type Customer = {
  id: string
  business_name: string
  owner_name: string | null
  owner_email: string
  owner_phone: string | null
  industry: string | null
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch customer using service role (bypasses RLS — user is already authenticated)
  const admin = createServiceClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: customer } = await admin
    .from('customers')
    .select('id, business_name, owner_name, owner_email, owner_phone, industry')
    .eq('auth_user_id', user.id)
    .maybeSingle<Customer>()

  if (!customer) redirect('/auth/error')

  // Pending actions count for sidebar badge
  const { count: pendingCount } = await admin
    .from('actions')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', customer.id)
    .eq('status', 'pending')

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar customer={customer} pendingCount={pendingCount ?? 0} isAdmin={user.email === 'mr.jonleetaylor@gmail.com'} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
