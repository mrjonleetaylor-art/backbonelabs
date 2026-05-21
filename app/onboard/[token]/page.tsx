import { createClient } from '@supabase/supabase-js';
import { OnboardingForm } from './OnboardingForm';

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ admin?: string }>;
};

export default async function OnboardingTokenPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { admin } = await searchParams;
  const isAdmin = admin === '1';

  const supabase = createClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: session, error } = await supabase
    .from('onboarding_sessions')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (error) {
    console.error('[onboarding page] fetch error:', error);
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-6">🔗</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Link not found</h1>
          <p className="text-slate-500 leading-relaxed">
            This onboarding link is invalid or has expired. Please contact your RelayDesk consultant for a new link.
          </p>
          <p className="mt-6 text-sm text-slate-400">
            Need help?{' '}
            <a href="tel:+61253023030" className="text-[#1E3A5F] hover:underline">
              02 5302 3030
            </a>
          </p>
        </div>
      </div>
    );
  }

  return <OnboardingForm token={token} initialData={session} isAdmin={isAdmin} />;
}
