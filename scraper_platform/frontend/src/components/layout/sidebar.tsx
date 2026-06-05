import { NavLink } from 'react-router-dom'
import {
  Activity,
  Bot,
  Globe,
  LayoutDashboard,
  ListOrdered,
  Server,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import { useHealth } from '@/hooks/use-health'
import { useUiStore } from '@/store/ui.store'
import { cn } from '@/utils/cn'

const navSections = [
  {
    label: null,
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Operations',
    items: [
      { to: '/jobs', label: 'Jobs', icon: ListOrdered },
      { to: '/queue', label: 'Queue', icon: Activity },
      { to: '/workers', label: 'Workers', icon: Server },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { to: '/proxies', label: 'Proxies', icon: Globe },
      { to: '/health', label: 'System Health', icon: Bot },
    ],
  },
  {
    label: 'Extraction',
    items: [{ to: '/extraction', label: 'Extraction Center', icon: Sparkles }],
  },
  {
    label: null,
    items: [{ to: '/settings', label: 'Settings', icon: Settings }],
  },
]

export function Sidebar({ mobile }: { mobile?: boolean }) {
  const { data: health } = useHealth()
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)

  return (
    <aside
      className={cn(
        'flex h-full w-60 flex-col border-r border-[var(--border)] bg-[var(--surface)]',
        mobile && 'w-full max-w-xs',
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary)] text-white text-xs font-bold">
            SP
          </div>
          <span className="text-sm font-semibold">Scraper</span>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-[var(--text-secondary)] hover:bg-[var(--background)]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {navSections.map((section, i) => (
          <div key={i}>
            {section.label && (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={'end' in item ? item.end : false}
                    onClick={() => mobile && setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-[var(--background)] text-[var(--primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)]',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
          System status
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              health?.status === 'ok' ? 'bg-[var(--success)]' : 'bg-[var(--error)]',
            )}
          />
          <span className="text-[var(--text-secondary)]">
            API {health?.status === 'ok' ? 'healthy' : 'unreachable'}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-[var(--text-secondary)]">
          Polling · no WebSocket API
        </p>
      </div>
    </aside>
  )
}
