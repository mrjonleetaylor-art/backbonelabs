import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return json({ error: 'unauthorized' }, 401)

  const admin = createServiceClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await admin
    .from('customers')
    .update({
      google_refresh_token: null,
      google_calendar_connected: false,
    })
    .eq('auth_user_id', user.id)

  if (error) {
    console.error('calendar disconnect error', error)
    return json({ error: 'disconnect failed' }, 500)
  }

  return json({ ok: true })
}
