interface IconProps {
  className?: string
}

export default function DashboardBuilderIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Outer workspace frame */}
      <rect x="3" y="3" width="18" height="18" rx="3" />
      {/* Top search & clock strip */}
      <path d="M3 8h18" />
      {/* Widget grid blocks */}
      <rect x="6" y="11" width="5" height="4" rx="1" className="fill-indigo-400/20" />
      <rect x="13" y="11" width="5" height="8" rx="1" className="fill-indigo-400/20" />
      <rect x="6" y="17" width="5" height="2" rx="0.5" />
    </svg>
  )
}
