import { Monitor, Moon, Sun } from 'lucide-react'
import { useThemeStore, type ThemeMode } from '@/store/theme.store'
import { Button } from './button'
import { cn } from '@/utils/cn'

const modes: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
]

export function ThemeToggle({ compact }: { compact?: boolean }) {
  const { mode, setMode } = useThemeStore()

  if (compact) {
    const next: ThemeMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light'
    const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMode(next)}
        aria-label="Toggle theme"
      >
        <Icon className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className="inline-flex rounded-md border border-[var(--border)] p-0.5 bg-[var(--surface)]">
      {modes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setMode(value)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors',
            mode === value
              ? 'bg-[var(--background)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          )}
          aria-label={`${label} theme`}
          aria-pressed={mode === value}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
