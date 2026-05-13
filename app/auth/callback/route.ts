import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/dashboard'
  const origin = url.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?message=Invalid+sign-in+link`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?message=Sign-in+link+expired`)
  }

  const user = data.user
  const email = user.email

  // Look up customer by owner_email
  const admin = createServiceClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: customer } = await admin
    .from('customers')
    .select('id, auth_user_id')
    .eq('owner_email', email)
    .maybeSingle()

  if (!customer) {
    // No customer record for this email
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  // Link auth_user_id on first login
  if (!customer.auth_user_id) {
    await admin
      .from('customers')
      .update({ auth_user_id: user.id })
      .eq('id', customer.id)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
