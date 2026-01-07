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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import type { ProductWithCategory } from '@/types/database'
import { formatCurrency } from '@/lib/utils'
import { Plus, Package, Pencil, Trash2, Star } from 'lucide-react'

const productSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  description: z.string().optional(),
  price: z.string().min(1, 'Preco e obrigatorio'),
  category_id: z.string().optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
})

type ProductFormData = z.infer<typeof productSchema>

export function ProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<ProductWithCategory | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const { data: products, isLoading } = useProducts()
  const { data: categories } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', description: '', price: '', is_active: true, is_featured: false },
  })

  function openCreateDialog() {
    setEditingProduct(null)
    setSelectedCategory('')
    reset({ name: '', description: '', price: '', is_active: true, is_featured: false })
    setIsDialogOpen(true)
  }

  function openEditDialog(product: ProductWithCategory) {
    setEditingProduct(product)
    setSelectedCategory(product.category_id ?? '')
    reset({ name: product.name, description: product.description ?? '', price: String(product.price), category_id: product.category_id ?? '', is_active: product.is_active, is_featured: product.is_featured })
    setIsDialogOpen(true)
  }

  async function onSubmit(data: ProductFormData) {
    const productData = { ...data, price: parseFloat(data.price.replace(',', '.')), category_id: selectedCategory || null }
    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, data: productData })
    } else {
      await createProduct.mutateAsync(productData)
    }
    setIsDialogOpen(false)
    reset()
  }

  async function handleDelete() {
    if (deletingProduct) {
      await deleteProduct.mutateAsync(deletingProduct.id)
      setDeletingProduct(null)
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Produtos" description="Gerencie seu cardapio" />
        <div className="bg-background rounded-xl border border-border"><div className="p-4 space-y-3">{[1, 2, 3, 4, 5].map((i) => (<Skeleton key={i} className="h-16 w-full" />))}</div></div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Produtos" description="Gerencie seu cardapio">
        <Button onClick={openCreateDialog}><Plus className="w-4 h-4 mr-2" />Novo Produto</Button>
      </PageHeader>

      {products?.length === 0 ? (
        <EmptyState icon={Package} title="Nenhum produto cadastrado" description="Comece criando seu primeiro produto para montar o cardapio.">
          <Button onClick={openCreateDialog}><Plus className="w-4 h-4 mr-2" />Criar Produto</Button>
        </EmptyState>
      ) : (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface">
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preco</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground" /></div>
                      <div>
                        <div className="flex items-center gap-2"><span className="font-medium">{product.name}</span>{product.is_featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}</div>
                        {product.description && <p className="text-sm text-muted-foreground truncate max-w-xs">{product.description}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category ? <Badge variant="secondary">{product.category.name}</Badge> : <span className="text-muted-foreground text-sm">Sem categoria</span>}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(product.price)}</TableCell>
                  <TableCell><Badge variant={product.is_active ? 'success' : 'secondary'}>{product.is_active ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingProduct(product)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" placeholder="Ex: Pizza Margherita" {...register('name')} error={errors.name?.message} /></div>
            <div className="space-y-2"><Label htmlFor="description">Descricao (opcional)</Label><Textarea id="description" placeholder="Descreva o produto..." {...register('description')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="price">Preco</Label><Input id="price" placeholder="0,00" {...register('price')} error={errors.price?.message} /></div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setValue('category_id', val) }}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{categories?.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 rounded border-border" /><Label htmlFor="is_active">Ativo</Label></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="is_featured" {...register('is_featured')} className="w-4 h-4 rounded border-border" /><Label htmlFor="is_featured">Destaque</Label></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" isLoading={createProduct.isPending || updateProduct.isPending}>{editingProduct ? 'Salvar' : 'Criar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Excluir Produto</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Tem certeza que deseja excluir o produto <strong>{deletingProduct?.name}</strong>? Esta acao nao pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingProduct(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} isLoading={deleteProduct.isPending}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
