import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-pitch text-white hover:bg-pitch-dark shadow-sm',
  accent: 'bg-lime text-ink hover:bg-lime-dark shadow-sm',
  outline: 'border border-ink/20 bg-white/70 text-ink hover:bg-white',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
}
const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pitch/20',
        'disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
