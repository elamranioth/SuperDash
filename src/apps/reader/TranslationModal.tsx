import { useState, useEffect } from 'react'
import {
  Languages,
  Volume2,
  Copy,
  Check,
  StickyNote,
  X,
  Loader2,
  Sparkles,
  Quote
} from 'lucide-react'
import { translationService } from '@/services/reader'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface TranslationModalProps {
  sourceText: string
  isOpen: boolean
  onClose: () => void
  onSaveAsNote: (arabicTranslation: string) => void
  onSaveAsQuote: (arabicTranslation: string) => void
}

export default function TranslationModal({
  sourceText,
  isOpen,
  onClose,
  onSaveAsNote,
  onSaveAsQuote
}: TranslationModalProps) {
  const [translatedText, setTranslatedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isCached, setIsCached] = useState(false)

  useEffect(() => {
    if (isOpen && sourceText.trim()) {
      setLoading(true)
      setError(null)
      setTranslatedText('')
      setCopied(false)

      translationService
        .translate(sourceText, 'en', 'ar')
        .then(res => {
          setTranslatedText(res.text)
          setIsCached(res.cached)
          setLoading(false)
        })
        .catch(err => {
          setError(err.message || 'Translation failed')
          setLoading(false)
        })
    }
  }, [isOpen, sourceText])

  if (!isOpen) return null

  const handleCopy = async () => {
    if (!translatedText) return
    sounds.playClick()
    try {
      await navigator.clipboard.writeText(translatedText)
    } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleSpeak = () => {
    sounds.playClick()
    translationService.speakArabic(translatedText)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <GlassPanel intensity="intense" className="p-5 border border-white/20 shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-sky-400">
              <Languages className="w-5 h-5" />
              <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-100">
                English <span className="text-slate-400 font-normal">→</span> Arabic Translation
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Original English Text */}
          <div className="mb-4">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">Original (English)</span>
            <div className="mt-1 p-3 rounded-xl bg-slate-900/50 border border-white/10 text-xs text-slate-300 max-h-24 overflow-y-auto leading-relaxed select-text">
              {sourceText}
            </div>
          </div>

          {/* Arabic Translation Result */}
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                الترجمة (Arabic)
              </span>
              {isCached && (
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                  Instant Cache
                </span>
              )}
            </div>

            <div
              dir="rtl"
              className="mt-1.5 p-4 rounded-xl bg-slate-950/70 border border-white/15 min-h-[90px] flex items-center justify-center text-right select-text"
            >
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-sky-400 animate-pulse py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الترجمة فورياً...</span>
                </div>
              ) : error ? (
                <div className="text-xs text-rose-400 text-center py-2">
                  <p>{error}</p>
                </div>
              ) : (
                <p className="text-base text-white leading-loose font-normal font-sans tracking-wide w-full">
                  {translatedText}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeak}
                disabled={!translatedText}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium transition-all disabled:opacity-40"
                title="Pronounce Arabic"
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                <span>استمع</span>
              </button>

              <button
                onClick={handleCopy}
                disabled={!translatedText}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium transition-all disabled:opacity-40"
                title="Copy Arabic Translation"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playSuccess()
                  onSaveAsNote(translatedText)
                }}
                disabled={!translatedText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-medium border border-purple-500/30 transition-all disabled:opacity-40 active:scale-95"
              >
                <StickyNote className="w-3.5 h-3.5 text-purple-400" />
                <span>Save Note</span>
              </button>

              <button
                onClick={() => {
                  sounds.playSuccess()
                  onSaveAsQuote(translatedText)
                }}
                disabled={!translatedText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-medium border border-emerald-500/30 transition-all disabled:opacity-40 active:scale-95"
              >
                <Quote className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save Quote</span>
              </button>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
