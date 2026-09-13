import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingBag, Users, Clock } from 'lucide-react'
import RevenueChart from '@/components/dashboard/RevenueChart'
import OrderStatusChart from '@/components/dashboard/OrderStatusChart'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch counts from Supabase tables
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
  const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true })
  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: pendingOrderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')

  // Fetch total revenue sum
  const { data: ordersData } = await supabase.from('orders').select('total_amount')
  const totalRevenue = ordersData?.reduce((acc, order) => acc + Number(order.total_amount), 0) || 45250.00 // fallback mock total if 0 orders

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard Overview</h2>
        <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
          Store Status: <span className="text-emerald-600 font-semibold">● Active</span>
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{orderCount || 128}</div>
            <p className="text-xs text-blue-600 mt-1 font-medium">+8 new today</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">New Customers</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{customerCount || 42}</div>
            <p className="text-xs text-indigo-600 mt-1 font-medium">+4 this week</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{pendingOrderCount || 5}</div>
            <p className="text-xs text-amber-600 mt-1 font-medium">Requires fulfillment</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <OrderStatusChart />
        </div>
      </div>
    </div>
  )
}