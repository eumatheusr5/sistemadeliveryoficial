import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="pl-64">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
