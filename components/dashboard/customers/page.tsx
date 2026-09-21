import { createClient } from '@/utils/supabase/server'
import { Badge } from '@/components/ui/badge'

export default async function CustomersPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Customers Directory</h2>
        <p className="text-sm text-slate-500 mt-1">View store customers and their contact details.</p>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Total Customers ({customers?.length || 0})</span>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b bg-slate-50/50 text-slate-500 font-medium">
              <th className="p-4">Customer Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers && customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-800">{customer.first_name} {customer.last_name}</td>
                  <td className="p-4 text-slate-600">{customer.email}</td>
                  <td className="p-4 text-slate-500">{customer.phone || 'N/A'}</td>
                  <td className="p-4">
                    <Badge variant={customer.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">
                    {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="h-24 text-center text-slate-500">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}