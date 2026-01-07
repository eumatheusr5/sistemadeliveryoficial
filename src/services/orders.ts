import { supabase } from '@/lib/supabase'
import type { Order, OrderInsert, OrderUpdate, OrderWithCustomer, OrderWithItems, OrderItemInsert, OrderStatus } from '@/types/database'

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as OrderWithCustomer[]
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      order_items(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as OrderWithItems
}

export async function getOrdersByStatus(status: OrderStatus) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as OrderWithCustomer[]
}

export async function createOrder(order: OrderInsert, items: OrderItemInsert[]) {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single()

  if (orderError) throw orderError

  const createdOrder = orderData as Order

  const itemsWithOrderId = items.map(item => ({
    ...item,
    order_id: createdOrder.id,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId)

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', createdOrder.id)
    throw itemsError
  }

  return createdOrder
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Order
}

export async function updateOrder(id: string, order: OrderUpdate) {
  const { data, error } = await supabase
    .from('orders')
    .update(order)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Order
}

export async function deleteOrder(id: string) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)

  if (error) throw error
}
