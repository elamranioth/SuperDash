import { LucideIcon } from 'lucide-react'
import GlassButton from './GlassButton'
import { sounds } from '@/utils/sound'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = ''
}: EmptyStateProps) {
  const ActionIcon = action?.icon
  const SecondaryActionIcon = secondaryAction?.icon

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 mb-4 shadow-inner relative group">
        <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-md -z-10 group-hover:bg-indigo-500/20 transition-all" />
        <Icon className="w-7 h-7 text-indigo-400/90" />
      </div>

      <h3 className="text-sm font-semibold text-white tracking-wide mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-5">{description}</p>

      <div className="flex items-center gap-3">
        {action && (
          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => {
              sounds.playClick()
              action.onClick()
            }}
          >
            {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
            <span>{action.label}</span>
          </GlassButton>
        )}

        {secondaryAction && (
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => {
              sounds.playClick()
              secondaryAction.onClick()
            }}
          >
            {SecondaryActionIcon && <SecondaryActionIcon className="w-3.5 h-3.5" />}
            <span>{secondaryAction.label}</span>
          </GlassButton>
        )}
      </div>
    </div>
  )
}
