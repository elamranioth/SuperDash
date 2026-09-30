import { useState } from 'react'
import {
  Highlighter,
  Languages,
  Quote,
  StickyNote,
  Copy,
  Check
} from 'lucide-react'
import { HighlightColor } from '@/types'
import { sounds } from '@/utils/sound'

interface TextSelectionToolbarProps {
  position: { x: number; y: number }
  selectedText: string
  onHighlight: (color: HighlightColor) => void
  onTranslate: () => void
  onSaveQuote: () => void
  onAddNote: () => void
  onClose: () => void
}

const HIGHLIGHT_COLORS: { color: HighlightColor; label: string; bgClass: string; borderClass: string }[] = [
  { color: 'yellow', label: 'Amber', bgClass: 'bg-amber-400', borderClass: 'border-amber-500' },
  { color: 'green', label: 'Emerald', bgClass: 'bg-emerald-400', borderClass: 'border-emerald-500' },
  { color: 'blue', label: 'Sky', bgClass: 'bg-sky-400', borderClass: 'border-sky-500' },
  { color: 'rose', label: 'Rose', bgClass: 'bg-rose-400', borderClass: 'border-rose-500' },
  { color: 'purple', label: 'Violet', bgClass: 'bg-purple-400', borderClass: 'border-purple-500' }
]

export default function TextSelectionToolbar({
  position,
  selectedText,
  onHighlight,
  onTranslate,
  onSaveQuote,
  onAddNote,
  onClose
}: TextSelectionToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    sounds.playClick()
    try {
      await navigator.clipboard.writeText(selectedText)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        onClose()
      }, 1000)
    } catch {
      // Fallback
    }
  }

  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="flex items-center gap-1 p-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/40 text-white text-xs select-none">
        {/* Highlight Color Picker Toggle / Circles */}
        {!showColorPicker ? (
          <button
            onClick={() => {
              sounds.playClick()
              setShowColorPicker(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/15 transition-all text-amber-300 font-medium active:scale-95"
            title="Highlight Text"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Highlight</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 px-1">
            {HIGHLIGHT_COLORS.map(c => (
              <button
                key={c.color}
                onClick={() => {
                  sounds.playSuccess()
                  onHighlight(c.color)
                }}
                className={`w-6 h-6 rounded-full ${c.bgClass} hover:scale-125 transition-transform active:scale-95 shadow-sm border ${c.borderClass}`}
                title={c.label}
              />
            ))}
          </div>
        )}

        <div className="w-[1px] h-4 bg-white/20 my-auto mx-0.5" />

        {/* Translate to Arabic */}
        <button
          onClick={() => {
            sounds.playClick()
            onTranslate()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/15 transition-all text-sky-300 font-medium active:scale-95"
          title="Translate to Arabic"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>ترجمة</span>
        </button>

        {/* Save Quote */}
        <button
          onClick={() => {
            sounds.playSuccess()
            onSaveQuote()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/15 transition-all text-emerald-300 font-medium active:scale-95"
          title="Save as Quote"
        >
          <Quote className="w-3.5 h-3.5" />
          <span>Quote</span>
        </button>

        {/* Add Note */}
        <button
          onClick={() => {
            sounds.playClick()
            onAddNote()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/15 transition-all text-purple-300 font-medium active:scale-95"
          title="Add Note"
        >
          <StickyNote className="w-3.5 h-3.5" />
          <span>Note</span>
        </button>

        <div className="w-[1px] h-4 bg-white/20 my-auto mx-0.5" />

        {/* Copy */}
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-full hover:bg-white/15 transition-all text-slate-300 hover:text-white active:scale-95"
          title={copied ? 'Copied!' : 'Copy to Clipboard'}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}
