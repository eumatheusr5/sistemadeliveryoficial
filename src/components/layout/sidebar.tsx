import { NavLink, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  FolderTree,
  Package,
  Users,
  LogOut,
  Truck,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ClipboardList, label: 'Pedidos', href: '/pedidos' },
  { icon: FolderTree, label: 'Categorias', href: '/categorias' },
  { icon: Package, label: 'Produtos', href: '/produtos' },
  { icon: Users, label: 'Clientes', href: '/clientes' },
]

export function Sidebar() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Logout realizado com sucesso!')
      navigate('/auth')
    } catch (error) {
      toast.error('Erro ao sair')
      console.error(error)
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">DeliveryPro</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface text-foreground'
                    : 'text-muted-foreground hover:bg-surface hover:text-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-surface px-3 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-background transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
