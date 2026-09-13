import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Verify user session on server
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile (role, full_name)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="p-6 text-xl font-bold text-white tracking-wider">
          OpsBoard <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Admin</span>
        </div>
        <nav className="flex-1 px-4 space-y-1 text-sm">
          <Link href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white font-medium">
            Overview
          </Link>
          <Link href="/dashboard/products" className="block px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white font-medium">
            Products
          </Link>
          <Link href="/dashboard/orders" className="block px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white font-medium">
            Orders
          </Link>
          <Link href="/dashboard/customers" className="block px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white font-medium">
            Customers
          </Link>
          <Link href="/dashboard/settings" className="block px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white font-medium">
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs">
          <p className="font-semibold text-white">{profile?.full_name || 'Staff User'}</p>
          <p className="text-slate-400 capitalize">Role: {profile?.role || 'staff'}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-slate-800">E-commerce Operations Dashboard</h1>
          <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/login')
          }}>
            <Button variant="outline" size="sm">Logout</Button>
          </form>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}