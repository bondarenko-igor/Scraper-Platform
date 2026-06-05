import { useLocation } from 'react-router-dom'
import { Menu, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/store/ui.store'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/jobs': 'Jobs',
  '/queue': 'Queue',
  '/workers': 'Workers',
  '/proxies': 'Proxies',
  '/health': 'System Health',
  '/extraction': 'Extraction Center',
  '/settings': 'Settings',
}

interface HeaderProps {
  globalSearch: string
  onGlobalSearchChange: (v: string) => void
}

export function Header({ globalSearch, onGlobalSearchChange }: HeaderProps) {
  const location = useLocation()
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const qc = useQueryClient()

  const title =
    location.pathname.startsWith('/jobs/') && location.pathname !== '/jobs'
      ? 'Job Details'
      : location.pathname.startsWith('/workers/')
        ? 'Worker Details'
        : titles[location.pathname] ?? 'Scraper Platform'

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--background)] px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleSidebar}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-sm font-semibold text-[var(--text-primary)] min-w-[120px]">{title}</h1>

      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <SearchInput
          value={globalSearch}
          onChange={onGlobalSearchChange}
          placeholder="Search jobs, URLs…"
          className="w-full"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void qc.invalidateQueries()}
          aria-label="Refresh all data"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <ThemeToggle compact />
      </div>
    </header>
  )
}
