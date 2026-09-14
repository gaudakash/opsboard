import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import ProductsTable from '@/components/products/ProductsTable'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  // Extract URL search params for filtering/pagination
  const search = (resolvedSearchParams?.search as string) || ''
  const category = (resolvedSearchParams?.category as string) || 'all'
  const status = (resolvedSearchParams?.status as string) || 'all'
  const page = Number(resolvedSearchParams?.page) || 1
  const pageSize = 10

  // Fetch categories for filter dropdown
  const { data: categories } = await supabase.from('categories').select('*')

  // Build query for products
  let query = supabase
    .from('products')
    .select('*, categories(name)', { count: 'exact' })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }
  if (category !== 'all') {
    query = query.eq('category_id', category)
  }
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Pagination range
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to).order('created_at', { ascending: false })

  const { data: products, count } = await query

  // Check user role for delete UI permissions
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single()

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Products Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your store inventory, stock, and pricing.</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <ProductsTable
        initialProducts={products || []}
        categories={categories || []}
        totalCount={count || 0}
        isAdmin={isAdmin}
      />
    </div>
  )
}