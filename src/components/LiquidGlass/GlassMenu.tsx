import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface GlassMenuProps {
  children: ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}

export default function GlassMenu({
  children,
  className,
  align = 'left'
}: GlassMenuProps) {
  const alignClass = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top'
  }

  return (
    <div
      className={cn(
        'absolute mt-2 min-w-[200px] liquid-glass-heavy rounded-2xl shadow-2xl z-50 p-1.5 animate-window-open border border-white/20',
        alignClass[align],
        className
      )}
    >
      <div className="glass-specular" />
      <div className="relative z-10 space-y-0.5">{children}</div>
    </div>
  )
}
