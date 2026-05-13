import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'
import PasswordForm from './PasswordForm'
import { Card, CardHeader, CardBody } from '../_components/Card'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createServiceClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: customer } = await admin
    .from('customers')
    .select('owner_name, owner_email, owner_phone')
    .eq('auth_user_id', user.id)
    .maybeSingle<{ owner_name: string | null; owner_email: string; owner_phone: string | null }>()

  if (!customer) redirect('/auth/error')

  return (
    <div className="p-8 max-w-[680px] mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-[28px] font-bold tracking-[-0.025em] text-slate-900">Account</h1>
        <p className="text-[13px] text-slate-400 mt-1">Manage your profile and login details.</p>
      </div>

      <Card>
        <CardHeader
          title="Profile"
          meta="Your name and contact details."
        />
        <CardBody>
          <ProfileForm customer={customer} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Password"
          meta="Set a password if you prefer not to use magic links."
        />
        <CardBody>
          <PasswordForm />
        </CardBody>
      </Card>
    </div>
  )
}
