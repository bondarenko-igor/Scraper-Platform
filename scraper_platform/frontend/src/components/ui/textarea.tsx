import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm',
        'text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
        'disabled:cursor-not-allowed disabled:opacity-50 font-mono',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
