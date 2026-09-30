import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  intensity?: 'subtle' | 'balanced' | 'intense'
  withSpecular?: boolean
  onClick?: () => void
}

export default function GlassPanel({
  children,
  className,
  intensity = 'balanced',
  withSpecular = true,
  onClick
}: GlassPanelProps) {
  const intensityMap = {
    subtle: 'bg-white/[0.04] backdrop-blur-md border-white/10',
    balanced: 'liquid-glass',
    intense: 'liquid-glass-heavy'
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-3xl relative overflow-hidden transition-all duration-300',
        intensityMap[intensity],
        className
      )}
    >
      {withSpecular && <div className="glass-specular" />}
      {children}
    </div>
  )
}
