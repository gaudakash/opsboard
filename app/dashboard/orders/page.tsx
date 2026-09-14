import { createClient } from '@/utils/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  const statusFilter = (resolvedSearchParams?.status as string) || 'all'

  let query = supabase
    .from('orders')
    .select('*, customers(first_name, last_name, email)')
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: orders } = await query

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Orders Management</h2>
        <p className="text-sm text-slate-500 mt-1">Track customer purchases and update fulfillment statuses.</p>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">All Orders ({orders?.length || 0})</span>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b bg-slate-50/50 text-slate-500 font-medium">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-800">{order.order_number}</td>
                  <td className="p-4 text-slate-600">
                    {order.customers ? `${order.customers.first_name} ${order.customers.last_name}` : 'Guest Customer'}
                  </td>
                  <td className="p-4 font-medium text-slate-900">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="h-4 w-4" /> View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="h-24 text-center text-slate-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}