import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, searchCustomerByPhone } from '@/services/customers'
import type { CustomerInsert, CustomerUpdate } from '@/types/database'
import { toast } from 'sonner'

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  })
}

export function useSearchCustomerByPhone(phone: string) {
  return useQuery({
    queryKey: ['customers', 'search', phone],
    queryFn: () => searchCustomerByPhone(phone),
    enabled: phone.length >= 3,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CustomerInsert) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Cliente criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar cliente')
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerUpdate }) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Cliente atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar cliente')
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Cliente excluido com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir cliente')
    },
  })
}
