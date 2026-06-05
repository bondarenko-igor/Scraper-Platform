import { useMemo, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/utils/cn'

interface JsonViewerProps {
  data: unknown
  className?: string
  maxHeight?: string
}

export function JsonViewer({ data, className, maxHeight = '24rem' }: JsonViewerProps) {
  const [copied, setCopied] = useState(false)
  const text = useMemo(() => {
    if (data == null) return ''
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }, [data])

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!text) {
    return (
      <p className="text-sm text-[var(--text-secondary)] italic">No data available</p>
    )
  }

  return (
    <div className={cn('relative rounded-md border border-[var(--border)]', className)}>
      <div className="absolute right-2 top-2 z-10">
        <Button variant="ghost" size="sm" onClick={copy} aria-label="Copy JSON">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <pre
        className="overflow-auto p-4 text-xs leading-relaxed text-[var(--text-primary)] bg-[var(--background)]"
        style={{ maxHeight }}
      >
        <code>{text}</code>
      </pre>
    </div>
  )
}

export function CodeViewer({
  content,
  language = 'html',
  className,
  maxHeight = '24rem',
}: {
  content: string | null | undefined
  language?: string
  className?: string
  maxHeight?: string
}) {
  if (!content) {
    return <p className="text-sm text-[var(--text-secondary)] italic">No content</p>
  }

  return (
    <div className={cn('rounded-md border border-[var(--border)]', className)}>
      <div className="border-b border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
        {language}
      </div>
      <pre
        className="overflow-auto p-4 text-xs leading-relaxed bg-[var(--background)] text-[var(--text-primary)]"
        style={{ maxHeight }}
      >
        <code>{content.length > 50_000 ? `${content.slice(0, 50_000)}\n… [truncated]` : content}</code>
      </pre>
    </div>
  )
}
