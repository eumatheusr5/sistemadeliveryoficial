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
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/use-customers'
import type { Customer } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { Plus, Users, Pencil, Trash2, Phone, Mail, MapPin } from 'lucide-react'

const customerSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  phone: z.string().min(1, 'Telefone e obrigatorio'),
  email: z.string().email('E-mail invalido').optional().or(z.literal('')),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

export function CustomersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: customers, isLoading } = useCustomers()
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()
  const deleteCustomer = useDeleteCustomer()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormData>({ resolver: zodResolver(customerSchema) })

  const filteredCustomers = customers?.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm))

  function openCreateDialog() {
    setEditingCustomer(null)
    reset({ name: '', phone: '', email: '', address: '', neighborhood: '', city: '', state: '', zip_code: '', notes: '' })
    setIsDialogOpen(true)
  }

  function openEditDialog(customer: Customer) {
    setEditingCustomer(customer)
    reset({ name: customer.name, phone: customer.phone, email: customer.email ?? '', address: customer.address ?? '', neighborhood: customer.neighborhood ?? '', city: customer.city ?? '', state: customer.state ?? '', zip_code: customer.zip_code ?? '', notes: customer.notes ?? '' })
    setIsDialogOpen(true)
  }

  async function onSubmit(data: CustomerFormData) {
    const customerData = { ...data, email: data.email || null }
    if (editingCustomer) {
      await updateCustomer.mutateAsync({ id: editingCustomer.id, data: customerData })
    } else {
      await createCustomer.mutateAsync(customerData)
    }
    setIsDialogOpen(false)
    reset()
  }

  async function handleDelete() {
    if (deletingCustomer) {
      await deleteCustomer.mutateAsync(deletingCustomer.id)
      setDeletingCustomer(null)
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Clientes" description="Gerencie sua base de clientes" />
        <div className="bg-background rounded-xl border border-border"><div className="p-4 space-y-3">{[1, 2, 3, 4, 5].map((i) => (<Skeleton key={i} className="h-16 w-full" />))}</div></div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Clientes" description="Gerencie sua base de clientes">
        <Input placeholder="Buscar por nome ou telefone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64" />
        <Button onClick={openCreateDialog}><Plus className="w-4 h-4 mr-2" />Novo Cliente</Button>
      </PageHeader>

      {customers?.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum cliente cadastrado" description="Comece cadastrando seu primeiro cliente.">
          <Button onClick={openCreateDialog}><Plus className="w-4 h-4 mr-2" />Cadastrar Cliente</Button>
        </EmptyState>
      ) : (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface">
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Endereco</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="w-[100px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers?.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center"><span className="text-sm font-semibold text-foreground">{customer.name.charAt(0).toUpperCase()}</span></div>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{customer.phone}</div>
                      {customer.email && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-3.5 h-3.5" />{customer.email}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.address ? (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                        <div><p>{customer.address}</p>{customer.neighborhood && <p className="text-muted-foreground">{customer.neighborhood}{customer.city && `, ${customer.city}`}{customer.state && ` - ${customer.state}`}</p>}</div>
                      </div>
                    ) : (<span className="text-muted-foreground text-sm">Nao informado</span>)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(customer.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(customer)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingCustomer(customer)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name">Nome *</Label><Input id="name" placeholder="Nome completo" {...register('name')} error={errors.name?.message} /></div>
              <div className="space-y-2"><Label htmlFor="phone">Telefone *</Label><Input id="phone" placeholder="(00) 00000-0000" {...register('phone')} error={errors.phone?.message} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" placeholder="email@exemplo.com" {...register('email')} error={errors.email?.message} /></div>
            <div className="space-y-2"><Label htmlFor="address">Endereco</Label><Input id="address" placeholder="Rua, numero, complemento" {...register('address')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="neighborhood">Bairro</Label><Input id="neighborhood" placeholder="Bairro" {...register('neighborhood')} /></div>
              <div className="space-y-2"><Label htmlFor="city">Cidade</Label><Input id="city" placeholder="Cidade" {...register('city')} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="state">Estado</Label><Input id="state" placeholder="UF" maxLength={2} {...register('state')} /></div>
              <div className="space-y-2"><Label htmlFor="zip_code">CEP</Label><Input id="zip_code" placeholder="00000-000" {...register('zip_code')} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="notes">Observacoes</Label><Textarea id="notes" placeholder="Observacoes sobre o cliente..." {...register('notes')} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" isLoading={createCustomer.isPending || updateCustomer.isPending}>{editingCustomer ? 'Salvar' : 'Cadastrar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingCustomer} onOpenChange={() => setDeletingCustomer(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Excluir Cliente</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Tem certeza que deseja excluir o cliente <strong>{deletingCustomer?.name}</strong>? Esta acao nao pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCustomer(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} isLoading={deleteCustomer.isPending}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
