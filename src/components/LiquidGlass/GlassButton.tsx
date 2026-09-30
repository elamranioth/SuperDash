import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { sounds } from '@/utils/sound'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  iconOnly?: boolean
}

export default function GlassButton({
  children,
  className,
  variant = 'default',
  size = 'md',
  iconOnly = false,
  onClick,
  ...props
}: GlassButtonProps) {
  const sizeMap = {
    sm: iconOnly ? 'p-1.5 rounded-xl text-xs' : 'px-2.5 py-1 rounded-xl text-xs font-medium',
    md: iconOnly ? 'p-2 rounded-2xl text-sm' : 'px-3.5 py-2 rounded-2xl text-xs md:text-sm font-medium',
    lg: iconOnly ? 'p-3 rounded-2xl text-base' : 'px-5 py-2.5 rounded-2xl text-sm font-semibold'
  }

  const variantMap = {
    default: 'liquid-glass-button text-slate-200 hover:text-white',
    primary:
      'bg-indigo-600/80 hover:bg-indigo-600 active:bg-indigo-700 text-white border border-indigo-400/40 shadow-lg shadow-indigo-500/25 backdrop-blur-md',
    danger:
      'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 backdrop-blur-md',
    ghost: 'hover:bg-white/10 text-slate-400 hover:text-white border border-transparent'
  }

  return (
    <button
      {...props}
      onClick={e => {
        sounds.playClick()
        if (onClick) onClick(e)
      }}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 select-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all duration-200',
        sizeMap[size],
        variantMap[variant],
        className
      )}
    >
      {children}
    </button>
  )
}
