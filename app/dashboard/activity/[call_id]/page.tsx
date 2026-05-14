import { redirect } from 'next/navigation'

export default async function CallDetailPage({ params }: { params: Promise<{ call_id: string }> }) {
  const { call_id } = await params
  redirect(`/dashboard/activity?open=${call_id}`)
}
