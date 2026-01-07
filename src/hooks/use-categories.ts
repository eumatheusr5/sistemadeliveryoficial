import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '@/services/categories'
import type { CategoryInsert, CategoryUpdate } from '@/types/database'
import { toast } from 'sonner'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CategoryInsert) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoria criada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar categoria')
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdate }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoria atualizada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar categoria')
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoria excluida com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir categoria')
    },
  })
}
