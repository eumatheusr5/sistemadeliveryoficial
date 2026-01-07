import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/layout/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useOrders, useUpdateOrderStatus, useOrder } from '@/hooks/use-orders'
import type { OrderWithCustomer, OrderStatus } from '@/types/database'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ClipboardList, Clock, CheckCircle, XCircle, Truck, ChefHat, Phone, MapPin, CreditCard, Banknote, QrCode } from 'lucide-react'

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'warning', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'accent', icon: CheckCircle },
  preparing: { label: 'Preparando', color: 'secondary', icon: ChefHat },
  delivering: { label: 'Em Entrega', color: 'accent', icon: Truck },
  delivered: { label: 'Entregue', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'destructive', icon: XCircle },
}

const paymentMethodLabels = {
  cash: { label: 'Dinheiro', icon: Banknote },
  credit_card: { label: 'Cartao de Credito', icon: CreditCard },
  debit_card: { label: 'Cartao de Debito', icon: CreditCard },
  pix: { label: 'PIX', icon: QrCode },
}

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered']

export function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null)
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all')

  const { data: orders, isLoading } = useOrders()
  const { data: orderDetails, isLoading: detailsLoading } = useOrder(selectedOrder?.id ?? '')
  const updateStatus = useUpdateOrderStatus()

  const filteredOrders = activeFilter === 'all' ? orders : orders?.filter((o) => o.status === activeFilter)

  const orderCounts = {
    all: orders?.length ?? 0,
    pending: orders?.filter((o) => o.status === 'pending').length ?? 0,
    confirmed: orders?.filter((o) => o.status === 'confirmed').length ?? 0,
    preparing: orders?.filter((o) => o.status === 'preparing').length ?? 0,
    delivering: orders?.filter((o) => o.status === 'delivering').length ?? 0,
    delivered: orders?.filter((o) => o.status === 'delivered').length ?? 0,
    cancelled: orders?.filter((o) => o.status === 'cancelled').length ?? 0,
  }

  function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const currentIndex = statusFlow.indexOf(currentStatus)
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null
    return statusFlow[currentIndex + 1]
  }

  async function handleAdvanceStatus(order: OrderWithCustomer) {
    const nextStatus = getNextStatus(order.status)
    if (nextStatus) {
      await updateStatus.mutateAsync({ id: order.id, status: nextStatus })
    }
  }

  async function handleCancelOrder(order: OrderWithCustomer) {
    await updateStatus.mutateAsync({ id: order.id, status: 'cancelled' })
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Pedidos" description="Gerencie os pedidos do delivery" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (<Card key={i} className="border-0 shadow-sm"><CardContent className="p-6"><Skeleton className="h-6 w-24 mb-4" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-32" /></CardContent></Card>))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Pedidos" description="Gerencie os pedidos do delivery" />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button variant={activeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('all')}>Todos ({orderCounts.all})</Button>
        {Object.entries(statusConfig).map(([status, config]) => (
          <Button key={status} variant={activeFilter === status ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter(status as OrderStatus)}>{config.label} ({orderCounts[status as OrderStatus]})</Button>
        ))}
      </div>

      {orders?.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nenhum pedido ainda" description="Os pedidos aparecerao aqui quando forem realizados." />
      ) : filteredOrders?.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nenhum pedido encontrado" description={`Nao ha pedidos com status "${statusConfig[activeFilter as OrderStatus]?.label}".`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders?.map((order) => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon
            const nextStatus = getNextStatus(order.status)

            return (
              <Card key={order.id} className={cn('border-0 shadow-sm cursor-pointer transition-all hover:shadow-md', order.status === 'pending' && 'ring-2 ring-amber-200')} onClick={() => setSelectedOrder(order)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="font-semibold text-lg">{order.customer?.name ?? 'Cliente nao identificado'}</p>
                    </div>
                    <Badge variant={status.color as 'warning' | 'success' | 'destructive' | 'secondary' | 'accent'}><StatusIcon className="w-3 h-3 mr-1" />{status.label}</Badge>
                  </div>

                  {order.customer?.phone && <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Phone className="w-3.5 h-3.5" />{order.customer.phone}</div>}
                  {order.delivery_address && <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3"><MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><span className="line-clamp-2">{order.delivery_address}</span></div>}

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(order.created_at)}</p>
                    </div>
                    {nextStatus && order.status !== 'cancelled' && (
                      <Button size="sm" variant="accent" onClick={(e) => { e.stopPropagation(); handleAdvanceStatus(order) }} isLoading={updateStatus.isPending}>{statusConfig[nextStatus].label}</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Pedido #{selectedOrder?.id.slice(0, 8).toUpperCase()}</span>
              {selectedOrder && <Badge variant={statusConfig[selectedOrder.status].color as 'warning' | 'success' | 'destructive' | 'secondary' | 'accent'}>{statusConfig[selectedOrder.status].label}</Badge>}
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-32 w-full" /></div>
          ) : orderDetails && (
            <div className="space-y-4">
              <div className="bg-surface rounded-lg p-4">
                <h4 className="font-semibold mb-2">Cliente</h4>
                <p className="font-medium">{orderDetails.customer?.name ?? 'Nao identificado'}</p>
                {orderDetails.customer?.phone && <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Phone className="w-3.5 h-3.5" />{orderDetails.customer.phone}</p>}
                {orderDetails.delivery_address && <p className="text-sm text-muted-foreground flex items-start gap-2 mt-1"><MapPin className="w-3.5 h-3.5 mt-0.5" />{orderDetails.delivery_address}</p>}
              </div>

              <div className="bg-surface rounded-lg p-4">
                <h4 className="font-semibold mb-3">Itens</h4>
                <div className="space-y-2">
                  {orderDetails.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm"><span>{item.quantity}x {item.product_name}</span><span className="font-medium">{formatCurrency(item.total_price)}</span></div>
                  ))}
                </div>
                <div className="border-t border-border mt-3 pt-3 space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(orderDetails.subtotal)}</span></div>
                  {orderDetails.delivery_fee > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Taxa de entrega</span><span>{formatCurrency(orderDetails.delivery_fee)}</span></div>}
                  {orderDetails.discount > 0 && <div className="flex justify-between text-sm text-success"><span>Desconto</span><span>-{formatCurrency(orderDetails.discount)}</span></div>}
                  <div className="flex justify-between font-semibold text-lg pt-2"><span>Total</span><span>{formatCurrency(orderDetails.total)}</span></div>
                </div>
              </div>

              {orderDetails.payment_method && paymentMethodLabels[orderDetails.payment_method] && (
                <div className="flex items-center gap-2 text-sm">
                  {(() => { const PaymentIcon = paymentMethodLabels[orderDetails.payment_method].icon; return <PaymentIcon className="w-4 h-4 text-muted-foreground" /> })()}
                  <span>{paymentMethodLabels[orderDetails.payment_method].label}</span>
                </div>
              )}

              {orderDetails.notes && <div className="bg-amber-50 rounded-lg p-3"><p className="text-sm text-amber-800"><strong>Observacoes:</strong> {orderDetails.notes}</p></div>}
            </div>
          )}

          <DialogFooter>
            {selectedOrder && selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
              <Button variant="outline" onClick={() => { handleCancelOrder(selectedOrder); setSelectedOrder(null) }}>Cancelar Pedido</Button>
            )}
            {selectedOrder && getNextStatus(selectedOrder.status) && (
              <Button variant="accent" onClick={() => { handleAdvanceStatus(selectedOrder); setSelectedOrder(null) }} isLoading={updateStatus.isPending}>Avancar para {statusConfig[getNextStatus(selectedOrder.status)!].label}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
