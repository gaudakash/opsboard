'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteProduct(productId: string) {
  const supabase = await createClient()

  // 1. Verify current logged-in user & role (Server-side RBAC security check!)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized: Please login' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Access Denied: Only Admins can delete products.' }
  }

  // 2. Perform delete
  const { error } = await supabase.from('products').delete().eq('id', productId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/products')
  return { success: true }
}