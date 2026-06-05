import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'MMM d, yyyy HH:mm:ss')
  } catch {
    return iso
  }
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true })
  } catch {
    return iso
  }
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function truncate(str: string, max = 48): string {
  if (str.length <= max) return str
  return `${str.slice(0, max)}…`
}

export function proxySuccessRate(success: number, failure: number): number {
  const total = success + failure
  if (total === 0) return 1
  return success / total
}
