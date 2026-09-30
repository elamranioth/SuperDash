interface IconProps {
  className?: string
}

export default function CollectionIcon({ className = 'w-5 h-5' }: IconProps) {
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
      {/* Background card */}
      <rect x="3" y="3" width="14" height="14" rx="3" className="opacity-40" />
      {/* Foreground card offset */}
      <rect x="7" y="7" width="14" height="14" rx="3" />
      {/* Inner spark/curation symbol */}
      <path d="M14 11v6" className="text-amber-400 stroke-amber-400" />
      <path d="M11 14h6" className="text-amber-400 stroke-amber-400" />
    </svg>
  )
}
