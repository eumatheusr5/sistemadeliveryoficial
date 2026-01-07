import { supabase } from '@/lib/supabase'
import type { Product, ProductInsert, ProductUpdate, ProductWithCategory } from '@/types/database'

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .order('name', { ascending: true })

  if (error) throw error
  return data as ProductWithCategory[]
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ProductWithCategory
}

export async function createProduct(product: ProductInsert) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function updateProduct(id: string, product: ProductUpdate) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}
