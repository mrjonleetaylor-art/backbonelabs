import { NextRequest } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const userId = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code || !userId) {
    return redirect('/dashboard/account?calendar_error=access_denied')
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/calendar/callback`,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    console.error('Google token exchange failed', await tokenRes.text())
    return redirect('/dashboard/account?calendar_error=token_exchange')
  }

  const tokens = (await tokenRes.json()) as { refresh_token?: string }
  const refreshToken = tokens.refresh_token

  if (!refreshToken) {
    return redirect('/dashboard/account?calendar_error=no_refresh_token')
  }

  const admin = createServiceClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: updateError } = await admin
    .from('customers')
    .update({
      google_refresh_token: refreshToken,
      google_calendar_connected: true,
    })
    .eq('auth_user_id', userId)

  if (updateError) {
    console.error('Google calendar update error', updateError)
    return redirect('/dashboard/account?calendar_error=db_update')
  }

  return redirect('/dashboard/account?connected=true')
}
