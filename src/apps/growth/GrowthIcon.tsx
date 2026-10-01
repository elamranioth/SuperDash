import React from 'react'

export default function GrowthIcon({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {/* Deep teal → emerald gradient base */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
      }} />

      {/* Top-left lighting */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 18%, rgba(255,255,255,0.28) 0%, transparent 60%)',
      }} />

      {/* Subtle inner shadow at bottom-right for depth */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 85% 88%, rgba(0,0,0,0.18) 0%, transparent 55%)',
      }} />

      {/* SVG artwork: upward path of connected dots ending in a spark */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-3/4 h-3/4"
        aria-hidden="true"
      >
        {/* Soft glow behind the path */}
        <ellipse cx="24" cy="28" rx="14" ry="10" fill="rgba(255,255,255,0.07)" />

        {/* Connecting path lines — upward curve */}
        <path
          d="M10 36 C14 30, 18 26, 22 22 C26 18, 30 14, 36 10"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Node dot 1 — bottom-left */}
        <circle cx="10" cy="36" r="2.5" fill="rgba(255,255,255,0.45)" />
        <circle cx="10" cy="36" r="1.4" fill="rgba(255,255,255,0.80)" />

        {/* Node dot 2 — mid-lower */}
        <circle cx="19" cy="27" r="2.2" fill="rgba(255,255,255,0.40)" />
        <circle cx="19" cy="27" r="1.2" fill="rgba(255,255,255,0.75)" />

        {/* Node dot 3 — mid-upper */}
        <circle cx="29" cy="18" r="2.2" fill="rgba(255,255,255,0.40)" />
        <circle cx="29" cy="18" r="1.2" fill="rgba(255,255,255,0.75)" />

        {/* Spark / terminal node — top-right */}
        {/* Outer glow ring */}
        <circle cx="37" cy="10" r="5.5" fill="rgba(255,255,255,0.12)" />
        {/* Mid ring */}
        <circle cx="37" cy="10" r="3.5" fill="rgba(255,255,255,0.30)" />
        {/* Core dot */}
        <circle cx="37" cy="10" r="2" fill="rgba(255,255,255,0.95)" />

        {/* Spark rays — 4 short lines radiating from top-right node */}
        <line x1="37" y1="4.5" x2="37" y2="3"   stroke="rgba(255,255,255,0.70)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="41.2" y1="5.8" x2="42.4" y2="4.6" stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" strokeLinecap="round" />
        <line x1="42.5" y1="10" x2="44" y2="10"  stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" strokeLinecap="round" />
        <line x1="41.2" y1="14.2" x2="42.4" y2="15.4" stroke="rgba(255,255,255,0.40)" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  )
}
