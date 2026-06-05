import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { useUiStore } from '@/store/ui.store'

export function DashboardLayout() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)
  const [globalSearch, setGlobalSearch] = useState('')

  return (
    <div className="flex h-full overflow-hidden">
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar mobile />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header globalSearch={globalSearch} onGlobalSearchChange={setGlobalSearch} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet context={{ globalSearch }} />
        </main>
      </div>
    </div>
  )
}

