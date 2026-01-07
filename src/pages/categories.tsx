import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/layout/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/use-categories'
import type { Category } from '@/types/database'
import { Plus, FolderTree, Pencil, Trash2 } from 'lucide-react'

const categorySchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  description: z.string().optional(),
  is_active: z.boolean(),
})

type CategoryFormData = z.infer<typeof categorySchema>

export function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', is_active: true },
  })

  function openCreateDialog() {
    setEditingCategory(null)
    reset({ name: '', description: '', is_active: true })
    setIsDialogOpen(true)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
    reset({ name: category.name, description: category.description ?? '', is_active: category.is_active })
    setIsDialogOpen(true)
  }

  async function onSubmit(data: CategoryFormData) {
    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, data })
    } else {
      await createCategory.mutateAsync(data)
    }
    setIsDialogOpen(false)
    reset()
  }

  async function handleDelete() {
    if (deletingCategory) {
      await deleteCategory.mutateAsync(deletingCategory.id)
      setDeletingCategory(null)
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Categorias" description="Gerencie as categorias dos produtos" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (<Card key={i} className="border-0 shadow-sm"><CardContent className="p-6"><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-48" /></CardContent></Card>))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Categorias" description="Gerencie as categorias dos produtos">
        <Button onClick={openCreateDialog}><Plus className="w-4 h-4 mr-2" />Nova Categoria</Button>
      </PageHeader>

      {categories?.length === 0 ? (
        <EmptyState icon={FolderTree} title="Nenhuma categoria cadastrada" description="Comece criando sua primeira categoria para organizar seus produtos.">
          <Button onClick={openCreateDialog}><Plus className="w-4 h-4 mr-2" />Criar Categoria</Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((category) => (
            <Card key={category.id} className="border-0 shadow-sm group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center"><FolderTree className="w-5 h-5 text-accent" /></div>
                    <div>
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <Badge variant={category.is_active ? 'success' : 'secondary'} className="mt-1">{category.is_active ? 'Ativa' : 'Inativa'}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingCategory(category)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
                {category.description && <p className="text-sm text-muted-foreground mt-3">{category.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" placeholder="Ex: Pizzas, Bebidas..." {...register('name')} error={errors.name?.message} /></div>
            <div className="space-y-2"><Label htmlFor="description">Descricao (opcional)</Label><Textarea id="description" placeholder="Descreva a categoria..." {...register('description')} /></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 rounded border-border" /><Label htmlFor="is_active">Categoria ativa</Label></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" isLoading={createCategory.isPending || updateCategory.isPending}>{editingCategory ? 'Salvar' : 'Criar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Excluir Categoria</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Tem certeza que deseja excluir a categoria <strong>{deletingCategory?.name}</strong>? Esta acao nao pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCategory(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} isLoading={deleteCategory.isPending}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
