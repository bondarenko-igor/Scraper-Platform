import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from './card'
import { cn } from '@/utils/cn'

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function MetricCard({ label, value, subtext, icon: Icon, className }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn('bg-[var(--surface)]', className)}>
        <CardContent className="flex items-start justify-between gap-3 p-4">
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)]">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {value}
            </p>
            {subtext && (
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{subtext}</p>
            )}
          </div>
          {Icon && (
            <div className="rounded-md bg-[var(--background)] p-2 text-[var(--primary)]">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
