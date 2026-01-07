import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrders } from '@/hooks/use-orders'
import { useProducts } from '@/hooks/use-products'
import { useCustomers } from '@/hooks/use-customers'
import { useCategories } from '@/hooks/use-categories'
import { formatCurrency } from '@/lib/utils'
import { ClipboardList, Package, Users, FolderTree, TrendingUp, Clock, Truck, CheckCircle } from 'lucide-react'

export function DashboardPage() {
  const { data: orders, isLoading: ordersLoading } = useOrders()
  const { data: products, isLoading: productsLoading } = useProducts()
  const { data: customers, isLoading: customersLoading } = useCustomers()
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  const isLoading = ordersLoading || productsLoading || customersLoading || categoriesLoading

  const pendingOrders = orders?.filter(o => o.status === 'pending').length ?? 0
  const preparingOrders = orders?.filter(o => o.status === 'preparing').length ?? 0
  const deliveringOrders = orders?.filter(o => o.status === 'delivering').length ?? 0
  const deliveredToday = orders?.filter(o => {
    const today = new Date().toDateString()
    return o.status === 'delivered' && new Date(o.created_at).toDateString() === today
  }).length ?? 0

  const todayRevenue = orders?.filter(o => {
    const today = new Date().toDateString()
    return o.status === 'delivered' && new Date(o.created_at).toDateString() === today
  }).reduce((sum, o) => sum + Number(o.total), 0) ?? 0

  const stats = [
    { title: 'Pedidos Pendentes', value: pendingOrders, icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-50' },
    { title: 'Em Preparacao', value: preparingOrders, icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { title: 'Em Entrega', value: deliveringOrders, icon: Truck, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { title: 'Entregues Hoje', value: deliveredToday, icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' },
  ]

  const summaryCards = [
    { title: 'Total de Pedidos', value: orders?.length ?? 0, icon: ClipboardList },
    { title: 'Total de Produtos', value: products?.length ?? 0, icon: Package },
    { title: 'Total de Clientes', value: customers?.length ?? 0, icon: Users },
    { title: 'Total de Categorias', value: categories?.length ?? 0, icon: FolderTree },
  ]

  return (
    <div>
      <PageHeader title="Dashboard" description="Visao geral do seu sistema de delivery" />

      <Card className="mb-6 bg-gradient-to-r from-accent to-orange-400 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80 mb-1">Faturamento de Hoje</p>
              {isLoading ? (
                <Skeleton className="h-10 w-32 bg-white/20" />
              ) : (
                <p className="text-4xl font-bold">{formatCurrency(todayRevenue)}</p>
              )}
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  {isLoading ? (
                    <><Skeleton className="h-8 w-12 mb-1" /><Skeleton className="h-4 w-24" /></>
                  ) : (
                    <><p className="text-2xl font-bold text-foreground">{stat.value}</p><p className="text-sm text-muted-foreground">{stat.title}</p></>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
