import { Suspense } from 'react';
import { OnboardForm } from './form';

export default function OnboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" />}>
      <OnboardForm />
    </Suspense>
  );
}
