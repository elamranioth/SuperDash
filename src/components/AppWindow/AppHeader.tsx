import React from 'react'
import { LucideIcon } from 'lucide-react'
import GlassButton from '@/components/LiquidGlass/GlassButton'
import { sounds } from '@/utils/sound'

interface AppHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  gradient?: string
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
    disabled?: boolean
    variant?: 'default' | 'primary' | 'ghost' | 'danger'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  children?: React.ReactNode
  className?: string
}

export default function AppHeader({
  title,
  subtitle,
  icon: Icon,
  gradient = 'from-indigo-500 to-purple-600',
  primaryAction,
  secondaryAction,
  children,
  className = ''
}: AppHeaderProps) {
  const PrimaryIcon = primaryAction?.icon
  const SecondaryIcon = secondaryAction?.icon

  return (
    <header
      className={`px-3 sm:px-5 py-2.5 sm:py-3.5 border-b border-white/10 flex flex-col gap-2 sm:gap-3 bg-black/20 shrink-0 select-none w-full max-w-full ${className}`}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Title & Subtitle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {Icon && (
            <div
              className={`p-1.5 sm:p-2 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm shrink-0`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">{title}</h1>
            {subtitle && (
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {secondaryAction && (
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => {
                sounds.playClick()
                secondaryAction.onClick()
              }}
            >
              {SecondaryIcon && <SecondaryIcon className="w-3.5 h-3.5" />}
              <span>{secondaryAction.label}</span>
            </GlassButton>
          )}

          {primaryAction && (
            <GlassButton
              variant={primaryAction.variant || 'primary'}
              size="sm"
              disabled={primaryAction.disabled}
              onClick={() => {
                sounds.playClick()
                primaryAction.onClick()
              }}
            >
              {PrimaryIcon && <PrimaryIcon className="w-3.5 h-3.5" />}
              <span>{primaryAction.label}</span>
            </GlassButton>
          )}
        </div>
      </div>

      {/* Optional sub-navigation / tabs */}
      {children && <div className="pt-0.5">{children}</div>}
    </header>
  )
}
