'use server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function saveProfile(
  field: 'owner_name' | 'owner_phone',
  value: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const admin = createServiceClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await admin
    .from('customers')
    .update({ [field]: value || null })
    .eq('auth_user_id', user.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function changePassword(
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  if (newPassword.length < 12) {
    return { ok: false, error: 'Password must be at least 12 characters.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
