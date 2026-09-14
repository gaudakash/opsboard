'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: {
  name: string
  description: string
  categoryId: string
  price: number
  compareAtPrice?: number
  sku: string
  stock: number
  status: string
  images: string[]
}) {
  const supabase = await createClient()

  // Verify admin role server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Access Denied: Only Admins can create products.' }
  }

  const slug = formData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

  const { error } = await supabase.from('products').insert({
    name: formData.name,
    slug: `${slug}-${Date.now()}`,
    description: formData.description,
    category_id: formData.categoryId || null,
    price: formData.price,
    compare_at_price: formData.compareAtPrice || null,
    sku: formData.sku,
    stock: formData.stock,
    status: formData.status,
    images: formData.images,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/products')
  redirect('/dashboard/products')
}