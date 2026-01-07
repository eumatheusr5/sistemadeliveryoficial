import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '@/services/products'
import type { ProductInsert, ProductUpdate } from '@/types/database'
import { toast } from 'sonner'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProductInsert) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar produto')
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdate }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar produto')
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto excluido com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir produto')
    },
  })
}
