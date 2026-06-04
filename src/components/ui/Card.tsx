import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-ink/10 bg-white/80 shadow-card backdrop-blur-sm', className)}
      {...props}
    />
  )
}
