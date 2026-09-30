import React from 'react'

interface AppIconProps {
  appId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * SuperDash Premium OS-Grade Icon Family
 * 
 * Crafted following strict OS design standards:
 * - 22% squircle border radius
 * - Directional top-left lighting
 * - 1px semi-transparent specular inner highlight on top and left
 * - Layered visual depth (rich gradient base, geometric relief, crisp glyph)
 * - Restrained, distinctive color identity per app
 */
export default function AppIcon({ appId, className = '', size = 'md' }: AppIconProps) {
  const todayDate = new Date().getDate()

  const renderIconContent = () => {
    switch (appId) {
      // 1. NOTES — Warm Amber / Golden Stationery
      case 'notes':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center overflow-hidden">
            {/* Soft inner texture */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.35)_0%,_transparent_60%)]" />
            {/* Notepad sheet silhouette */}
            <div className="relative w-[52%] h-[62%] bg-white/95 rounded-[4px] shadow-md p-1.5 flex flex-col justify-between">
              {/* Top orange binding accent */}
              <div className="h-1.5 bg-amber-500/80 rounded-t-[2px] w-full" />
              {/* Ruled lines */}
              <div className="space-y-1 my-auto">
                <div className="h-0.5 bg-slate-300 rounded w-full" />
                <div className="h-0.5 bg-slate-300 rounded w-4/5" />
                <div className="h-0.5 bg-amber-400 rounded w-3/5" />
              </div>
              {/* Bottom tag indicator */}
              <div className="h-0.5 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        )

      // 2. CALENDAR — Vermilion Red Desk Calendar
      case 'calendar':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-rose-500 via-red-600 to-red-800 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.35)_0%,_transparent_60%)]" />
            {/* Calendar card */}
            <div className="relative w-[58%] h-[64%] bg-white/95 rounded-lg shadow-md flex flex-col overflow-hidden">
              {/* Header tear-off bar */}
              <div className="bg-red-600 h-[28%] flex items-center justify-around px-1.5">
                <div className="w-1 h-1.5 rounded-full bg-black/30" />
                <div className="w-1 h-1.5 rounded-full bg-black/30" />
              </div>
              {/* Date display */}
              <div className="flex-1 flex items-center justify-center">
                <span className="font-extrabold text-slate-900 text-sm sm:text-base leading-none tracking-tight">
                  {todayDate}
                </span>
              </div>
            </div>
          </div>
        )

      // 3. TASKS — Vibrant Emerald / Teal Checklist
      case 'tasks':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 via-teal-600 to-emerald-800 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.4)_0%,_transparent_60%)]" />
            {/* Checklist card */}
            <div className="relative w-[54%] h-[60%] bg-emerald-950/40 rounded-lg border border-white/20 shadow-inner flex flex-col justify-center gap-1.5 p-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-white flex items-center justify-center shadow-xs">
                  <svg className="w-2.5 h-2.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="h-1 bg-white/80 rounded flex-1" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-white/30 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="h-1 bg-white/50 rounded flex-1" />
              </div>
            </div>
          </div>
        )

      // 4. CALCULATOR — Deep Orange Math Keypad
      case 'calculator':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-orange-400 via-amber-600 to-orange-700 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.4)_0%,_transparent_60%)]" />
            {/* 4 Quadrants (+ - × =) */}
            <div className="grid grid-cols-2 gap-1 w-[56%] h-[56%]">
              <div className="bg-white/20 backdrop-blur-xs rounded flex items-center justify-center text-white font-bold text-xs shadow-xs border border-white/10">
                +
              </div>
              <div className="bg-white/20 backdrop-blur-xs rounded flex items-center justify-center text-white font-bold text-xs shadow-xs border border-white/10">
                −
              </div>
              <div className="bg-white/20 backdrop-blur-xs rounded flex items-center justify-center text-white font-bold text-xs shadow-xs border border-white/10">
                ×
              </div>
              <div className="bg-white text-orange-600 rounded flex items-center justify-center font-bold text-xs shadow-sm">
                =
              </div>
            </div>
          </div>
        )

      // 5. TIME — Liquid Glass Hourglass & Focus Sphere
      case 'time':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-800 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.4)_0%,_transparent_60%)]" />
            {/* Concentric subtle clock ring */}
            <div className="absolute w-[76%] h-[76%] rounded-full border border-white/20" />
            {/* Hourglass Vector */}
            <svg
              className="relative w-[50%] h-[50%] text-white drop-shadow-md"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 22h14" />
              <path d="M5 2h14" />
              <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
              <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
              {/* Glowing sand grains */}
              <circle cx="12" cy="16.5" r="1.5" fill="#FBBF24" stroke="none" />
              <circle cx="12" cy="13.5" r="0.75" fill="#FDE68A" stroke="none" />
            </svg>
          </div>
        )

      // 6. WEATHER — Atmospheric Sun & Translucent Cloud
      case 'weather':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-700 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.4)_0%,_transparent_60%)]" />
            {/* Golden radiant sun */}
            <div className="absolute top-[20%] right-[22%] w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 shadow-md shadow-amber-400/50" />
            {/* Translucent cloud glyph */}
            <svg
              className="relative w-[56%] h-[56%] text-white/95 drop-shadow-lg mt-2"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" opacity="0.95" />
            </svg>
          </div>
        )

      // 7. FILES — Royal Blue OS Folder & Peeking Sheet
      case 'files':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-800 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.35)_0%,_transparent_60%)]" />
            {/* Peeking Document Sheet */}
            <div className="absolute top-[22%] w-[42%] h-[40%] bg-white rounded-t shadow-xs" />
            {/* Front folder flap */}
            <div className="relative w-[60%] h-[50%] bg-gradient-to-t from-sky-300 via-sky-200 to-white rounded-lg shadow-lg flex items-center justify-center border-t border-white/60">
              <div className="w-4 h-0.5 bg-blue-600/30 rounded" />
            </div>
          </div>
        )

      // 8. READER — Warm Terracotta Open Book
      case 'reader':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.35)_0%,_transparent_60%)]" />
            {/* Open Book Vector */}
            <svg
              className="relative w-[54%] h-[54%] text-white drop-shadow-md"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
        )

      // 9. IDEAS — Electric Amber Lightbulb
      case 'ideas':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.45)_0%,_transparent_60%)]" />
            {/* Filament glow pulse */}
            <div className="absolute w-8 h-8 rounded-full bg-yellow-200/30 blur-sm pointer-events-none" />
            <svg
              className="relative w-[52%] h-[52%] text-white drop-shadow-md"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
          </div>
        )

      // 10. COLLECTIONS — Curated Triple Gallery Stack
      case 'collections':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.35)_0%,_transparent_60%)]" />
            {/* Stacked Cards */}
            <div className="relative w-[54%] h-[54%] flex items-center justify-center">
              <div className="absolute w-[70%] h-[70%] rounded-md bg-white/20 rotate-[-12deg] shadow-xs" />
              <div className="absolute w-[74%] h-[74%] rounded-md bg-white/40 rotate-[10deg] shadow-xs" />
              <div className="relative w-[78%] h-[78%] rounded-md bg-white text-indigo-700 shadow-md flex items-center justify-center font-bold text-xs">
                ✦
              </div>
            </div>
          </div>
        )

      // 11. DECISION BOOK — Deep Navy Leather Journal with Bookmark
      case 'decisionbook':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.35)_0%,_transparent_60%)]" />
            {/* Journal cover */}
            <div className="relative w-[50%] h-[62%] bg-indigo-950/80 rounded-md border border-white/20 shadow-md flex flex-col justify-between p-1.5 overflow-hidden">
              <div className="absolute top-0 right-2 w-2 h-4 bg-amber-400 rounded-b shadow-xs" />
              <div className="h-0.5 bg-amber-400/60 w-3 rounded mt-0.5" />
              <div className="space-y-0.5 my-auto">
                <div className="h-0.5 bg-white/40 rounded w-full" />
                <div className="h-0.5 bg-white/30 rounded w-3/4" />
              </div>
            </div>
          </div>
        )

      // 12. LIVE — Radiant Living Leaf & Mindfulness Bloom
      case 'live':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-rose-400 via-rose-500 to-amber-500 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.4)_0%,_transparent_60%)]" />
            {/* Radiant pulse circle */}
            <div className="absolute w-8 h-8 rounded-full border border-white/30 animate-pulse pointer-events-none" />
            {/* Living Leaf */}
            <svg
              className="relative w-[52%] h-[52%] text-white drop-shadow-md"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 4 13C4 6 11 3 11 3s7 3 7 10a7 7 0 0 1-7 7Z" />
              <path d="M11 20v-7" />
            </svg>
          </div>
        )

      // 13. HEARINGS — Judicial Mahogany Brass Scale
      case 'hearings':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-amber-700 via-amber-800 to-stone-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.3)_0%,_transparent_60%)]" />
            {/* Balanced Scale */}
            <svg
              className="relative w-[54%] h-[54%] text-amber-200 drop-shadow-md"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
              <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
              <path d="M7 21h10" />
              <path d="M12 3v18" />
              <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
            </svg>
          </div>
        )

      // 14. FINANCE — Jade Mint Card & Secure Ledger
      case 'finance':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 via-emerald-700 to-teal-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.35)_0%,_transparent_60%)]" />
            {/* Modern payment card */}
            <div className="relative w-[62%] h-[48%] bg-emerald-950/80 rounded-md border border-emerald-400/40 shadow-md p-1.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-2.5 h-2 rounded-[2px] bg-amber-400/90 shadow-xs" />
                <span className="text-[8px] font-mono text-emerald-300 font-bold">AED</span>
              </div>
              <div className="h-0.5 bg-white/40 rounded w-1/2" />
            </div>
          </div>
        )

      // 15. SETTINGS — Titanium Gunmetal Precision Gear
      case 'settings':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-slate-500 via-slate-600 to-zinc-800 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.35)_0%,_transparent_60%)]" />
            {/* Concentric machined gear */}
            <svg
              className="relative w-[54%] h-[54%] text-slate-100 drop-shadow-md"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        )

      // Fallback
      default:
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base">
            {appId.charAt(0).toUpperCase()}
          </div>
        )
    }
  }

  const sizeClasses =
    size === 'sm'
      ? 'w-12 h-12'
      : size === 'lg'
      ? 'w-20 h-20'
      : 'w-16 h-16 sm:w-[70px] sm:h-[70px] md:w-20 md:h-20'

  return (
    <div
      className={`relative ${sizeClasses} rounded-[22%] shadow-[0_8px_20px_-4px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 group-hover:shadow-[0_12px_24px_-4px_rgba(99,102,241,0.35)] shrink-0 ${className}`}
    >
      {/* 1px Specular Bevel on Top and Left border */}
      <div className="absolute inset-0 rounded-[22%] border-t border-l border-white/45 border-r border-b border-black/25 pointer-events-none z-10" />

      {/* Subtle top-to-bottom ambient light sheen */}
      <div className="absolute inset-0 rounded-[22%] bg-gradient-to-b from-white/25 via-transparent to-black/20 pointer-events-none z-10" />

      {/* Main Vector / Layered Artwork */}
      {renderIconContent()}
    </div>
  )
}
