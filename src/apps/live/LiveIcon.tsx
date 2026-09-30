interface LiveIconProps {
  className?: string
}

export default function LiveIcon({ className = 'w-5 h-5' }: LiveIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Three gentle morning sun rays */}
      <line x1="12" y1="3" x2="12" y2="6" />
      <line x1="5.6" y1="6.6" x2="7.8" y2="8.8" />
      <line x1="18.4" y1="6.6" x2="16.2" y2="8.8" />

      {/* Sun rising above horizon */}
      <path d="M7 14a5 5 0 0 1 10 0" />

      {/* The calm horizon line */}
      <line x1="3" y1="17" x2="21" y2="17" />

      {/* Subtle reflection on the water / world below */}
      <line x1="8" y1="21" x2="16" y2="21" />
    </svg>
  )
}
