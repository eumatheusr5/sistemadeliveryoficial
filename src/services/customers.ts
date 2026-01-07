import { supabase } from '@/lib/supabase'
import type { Customer, CustomerInsert, CustomerUpdate } from '@/types/database'

export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data as Customer[]
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Customer
}

export async function searchCustomerByPhone(phone: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .ilike('phone', `%${phone}%`)
    .limit(10)

  if (error) throw error
  return data as Customer[]
}

export async function createCustomer(customer: CustomerInsert) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single()

  if (error) throw error
  return data as Customer
}

export async function updateCustomer(id: string, customer: CustomerUpdate) {
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Customer
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) throw error
}
