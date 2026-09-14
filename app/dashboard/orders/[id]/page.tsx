import { createClient } from '@/utils/supabase/server'
import OrderDetailPage from './OrderDetailClient'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, customers(*)')
    .eq('id', resolvedParams.id)
    .single()

  return <OrderDetailPage params={params} initialOrder={order} />
}