import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrders, getOrderById, getOrdersByStatus, createOrder, updateOrderStatus, updateOrder, deleteOrder } from '@/services/orders'
import type { OrderInsert, OrderUpdate, OrderItemInsert, OrderStatus } from '@/types/database'
import { toast } from 'sonner'

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  })
}

export function useOrdersByStatus(status: OrderStatus) {
  return useQuery({
    queryKey: ['orders', 'status', status],
    queryFn: () => getOrdersByStatus(status),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ order, items }: { order: OrderInsert; items: OrderItemInsert[] }) => 
      createOrder(order, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Pedido criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar pedido')
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => 
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Status atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar status')
    },
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrderUpdate }) => updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Pedido atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar pedido')
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Pedido excluido com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir pedido')
    },
  })
}
