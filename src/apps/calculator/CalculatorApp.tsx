import { useState, useEffect, useCallback } from 'react'
import {
  RotateCcw,
  Delete,
  History,
  Sparkles,
  Copy,
  Check,
  Calculator as CalcIcon,
  Trash2
} from 'lucide-react'
import { sounds } from '@/utils/sound'
import AppHeader from '@/components/AppWindow/AppHeader'
import MobileBottomSheet from '@/components/Mobile/MobileBottomSheet'

interface HistoryEntry {
  equation: string
  result: string
  timestamp: number
}

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0')
  const [equation, setEquation] = useState('')
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showScientific, setShowScientific] = useState(false)
  const [memory, setMemory] = useState<number>(0)
  const [copied, setCopied] = useState(false)

  const handleDigit = useCallback((digit: string) => {
    sounds.playClick()
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(prev => (prev === '0' ? digit : prev + digit))
    }
  }, [waitingForOperand])

  const handleDecimal = useCallback(() => {
    sounds.playClick()
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }
    if (!display.includes('.')) {
      setDisplay(prev => prev + '.')
    }
  }, [display, waitingForOperand])

  const handleOperator = useCallback((nextOp: string) => {
    sounds.playClick()
    const opDisplay = nextOp === '*' ? '×' : nextOp === '/' ? '÷' : nextOp
    setEquation(`${display} ${opDisplay}`)
    setWaitingForOperand(true)
  }, [display])

  const calculate = useCallback(() => {
    sounds.playClick()
    if (!equation) return

    const parts = equation.trim().split(' ')
    if (parts.length < 2) return

    const first = parseFloat(parts[0])
    const op = parts[1]
    const second = parseFloat(display)

    let result = 0
    switch (op) {
      case '+':
        result = first + second
        break
      case '-':
        result = first - second
        break
      case '×':
      case '*':
        result = first * second
        break
      case '÷':
      case '/':
        result = second !== 0 ? first / second : NaN
        break
      default:
        return
    }

    const formattedResult = isNaN(result)
      ? 'Error'
      : Number.isInteger(result)
      ? result.toString()
      : parseFloat(result.toFixed(8)).toString()

    setHistory(prev => [
      {
        equation: `${parts[0]} ${op} ${display}`,
        result: formattedResult,
        timestamp: Date.now()
      },
      ...prev.slice(0, 29)
    ])

    setDisplay(formattedResult)
    setEquation(`${parts[0]} ${op} ${display} =`)
    setWaitingForOperand(true)
  }, [display, equation])

  const handleClear = useCallback(() => {
    sounds.playClick()
    setDisplay('0')
    setEquation('')
    setWaitingForOperand(false)
  }, [])

  const handleBackspace = useCallback(() => {
    sounds.playClick()
    if (waitingForOperand) return
    setDisplay(prev => {
      if (prev.length <= 1) return '0'
      return prev.slice(0, -1)
    })
  }, [waitingForOperand])

  const handleToggleSign = useCallback(() => {
    sounds.playClick()
    setDisplay(prev => {
      const num = parseFloat(prev)
      if (num === 0) return '0'
      return (-num).toString()
    })
  }, [])

  const handlePercentage = useCallback(() => {
    sounds.playClick()
    setDisplay(prev => {
      const num = parseFloat(prev)
      return (num / 100).toString()
    })
  }, [])

  // Memory functions
  const handleMemoryClear = () => {
    sounds.playClick()
    setMemory(0)
  }

  const handleMemoryRecall = () => {
    sounds.playClick()
    setDisplay(memory.toString())
    setWaitingForOperand(true)
  }

  const handleMemoryAdd = () => {
    sounds.playClick()
    setMemory(prev => prev + parseFloat(display || '0'))
    setWaitingForOperand(true)
  }

  const handleMemorySubtract = () => {
    sounds.playClick()
    setMemory(prev => prev - parseFloat(display || '0'))
    setWaitingForOperand(true)
  }

  // Copy result
  const handleCopyResult = () => {
    sounds.playClick()
    navigator.clipboard?.writeText(display)?.catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // Scientific functions
  const handleScientific = (fn: string) => {
    sounds.playClick()
    const num = parseFloat(display)
    let res = 0
    switch (fn) {
      case 'sin':
        res = Math.sin((num * Math.PI) / 180)
        break
      case 'cos':
        res = Math.cos((num * Math.PI) / 180)
        break
      case 'tan':
        res = Math.tan((num * Math.PI) / 180)
        break
      case 'sqrt':
        res = Math.sqrt(num)
        break
      case 'sq':
        res = Math.pow(num, 2)
        break
      case 'ln':
        res = Math.log(num)
        break
      case 'log10':
        res = Math.log10(num)
        break
      case 'pi':
        res = Math.PI
        break
      case 'e':
        res = Math.E
        break
      default:
        return
    }
    const str = isNaN(res) ? 'Error' : parseFloat(res.toFixed(8)).toString()
    setDisplay(str)
    setWaitingForOperand(true)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key)
      } else if (e.key === '.') {
        handleDecimal()
      } else if (e.key === '+' || e.key === '-') {
        handleOperator(e.key)
      } else if (e.key === '*') {
        handleOperator('×')
      } else if (e.key === '/') {
        e.preventDefault()
        handleOperator('÷')
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault()
        calculate()
      } else if (e.key === 'Backspace') {
        handleBackspace()
      } else if (e.key === 'Escape') {
        handleClear()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDigit, handleDecimal, handleOperator, calculate, handleBackspace, handleClear])

  return (
    <div className="flex h-full w-full flex-col bg-slate-950/90 text-white select-none overflow-hidden">
      {/* Standardized App Header */}
      <AppHeader
        icon={CalcIcon}
        title="Calculator"
        subtitle={showScientific ? 'Scientific Precision Mode' : 'Standard Desktop Calculator'}
        gradient="from-amber-500 to-orange-600"
        primaryAction={{
          label: showHistory ? 'Hide History' : 'History Tape',
          icon: History,
          variant: showHistory ? 'primary' : 'default',
          onClick: () => setShowHistory(!showHistory)
        }}
        secondaryAction={{
          label: showScientific ? 'Standard' : 'Scientific',
          icon: Sparkles,
          onClick: () => setShowScientific(!showScientific)
        }}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Main Calculator Pad */}
        <div className="flex-1 flex flex-col p-2.5 sm:p-4 md:p-6 justify-between max-w-xl mx-auto w-full min-w-0">
          {/* Expression & Result Display View */}
          <div className="mb-2 sm:mb-4 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-black/50 border border-white/10 flex flex-col justify-end items-end min-h-[85px] sm:min-h-[105px] shadow-inner relative group shrink-0">
            {/* Copy button */}
            <button
              onClick={handleCopyResult}
              className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px]"
              title="Copy result"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Expression above */}
            <div className="text-xs font-mono text-slate-400 h-5 overflow-hidden text-ellipsis whitespace-nowrap tracking-wide">
              {equation || '\u00A0'}
            </div>

            {/* Dominated Result */}
            <div className="text-3xl sm:text-4xl md:text-5xl font-mono tracking-tight font-light text-white overflow-x-auto max-w-full text-right mt-0.5 no-scrollbar">
              {display}
            </div>
          </div>

          {/* Memory Bar */}
          <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
            <button
              onClick={handleMemoryClear}
              className="py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition font-mono border border-white/5"
            >
              MC
            </button>
            <button
              onClick={handleMemoryRecall}
              className={`py-1.5 rounded-xl transition font-mono border ${
                memory !== 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border-white/5'
              }`}
            >
              MR {memory !== 0 && '•'}
            </button>
            <button
              onClick={handleMemoryAdd}
              className="py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition font-mono border border-white/5"
            >
              M+
            </button>
            <button
              onClick={handleMemorySubtract}
              className="py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition font-mono border border-white/5"
            >
              M-
            </button>
          </div>

          {/* Scientific Panel (if toggled) */}
          {showScientific && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {[
                { label: 'sin', action: () => handleScientific('sin') },
                { label: 'cos', action: () => handleScientific('cos') },
                { label: 'tan', action: () => handleScientific('tan') },
                { label: '√x', action: () => handleScientific('sqrt') },
                { label: 'x²', action: () => handleScientific('sq') },
                { label: 'ln', action: () => handleScientific('ln') },
                { label: 'log', action: () => handleScientific('log10') },
                { label: 'π', action: () => handleScientific('pi') },
                { label: 'e', action: () => handleScientific('e') },
                { label: '%', action: handlePercentage }
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 transition text-indigo-300 border border-white/5"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2 md:gap-2.5 flex-1">
            {/* Row 1 */}
            <button
              onClick={handleClear}
              className="py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-400 font-medium text-base border border-rose-500/20 transition flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>AC</span>
            </button>
            <button
              onClick={handleToggleSign}
              className="py-3 rounded-2xl bg-white/[0.05] hover:bg-white/10 active:scale-95 text-slate-300 font-medium text-base border border-white/5 transition"
            >
              ±
            </button>
            <button
              onClick={handlePercentage}
              className="py-3 rounded-2xl bg-white/[0.05] hover:bg-white/10 active:scale-95 text-slate-300 font-medium text-base border border-white/5 transition"
            >
              %
            </button>
            <button
              onClick={() => handleOperator('÷')}
              className="py-3 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 active:scale-95 text-white font-medium text-lg border border-indigo-400/30 transition shadow-sm"
            >
              ÷
            </button>

            {/* Row 2 */}
            <button
              onClick={() => handleDigit('7')}
              className="py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 text-white font-medium text-lg border border-white/5 transition"
            >
              7
            </button>
            <button
              onClick={() => handleDigit('8')}
              className="py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 text-white font-medium text-lg border border-white/5 transition"
            >
              8
            </button>
            <button
              onClick={() => handleDigit('9')}
              className="py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 text-white font-medium text-lg border border-white/5 transition"
            >
              9
            </button>
            <button
              onClick={() => handleOperator('×')}
              className="py-3.5 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 active:scale-95 text-white font-medium text-lg border border-indigo-400/30 transition shadow-sm"
            >
              ×
            </button>

            {/* Row 3 */}
            <button
              onClick={() => handleDigit('4')}
              className="py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 text-white font-medium text-lg border border-white/5 transition"
            >
              4
            </button>
            <button
              onClick={() => handleDigit('5')}
              className="py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 text-white font-medium text-lg border border-white/5 transition"
            >
              5
            </button>
            <button
              onClick={() => handleDigit('6')}
              className="py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 text-white font-medium text-lg border border-white/5 transition"
            >
              6
            </button>
            <button
              onClick={() => handleOperator('-')}
              className="py-3.5 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 active:scale-95 text-white font-medium text-lg border border-indigo-400/30 transition shadow-sm"
            >
              −
            </button>

            {/* Row 4 */}
            <button
              onClick={() => handleDigit('1')}
              className="py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 text-white font-medium text-lg border border-white/5 transition"
            >
              1
            </button>
            <button
              onClick={() => handleDigit('2')}
              className="py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 text-white font-medium text-lg border border-white/5 transition"
            >
              2
            </button>
            <button
              onClick={() => handleDigit('3')}
              className="py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 text-white font-medium text-lg border border-white/5 transition"
            >
              3
            </button>
            <button
              onClick={() => handleOperator('+')}
              className="py-3.5 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 active:scale-95 text-white font-medium text-lg border border-indigo-400/30 transition shadow-sm"
            >
              +
            </button>

            {/* Row 5 */}
            <button
              onClick={() => handleDigit('0')}
              className="col-span-1 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 text-white font-medium text-lg border border-white/5 transition"
            >
              0
            </button>
            <button
              onClick={handleDecimal}
              className="py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 text-white font-medium text-lg border border-white/5 transition font-mono"
            >
              .
            </button>
            <button
              onClick={handleBackspace}
              className="py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/10 active:scale-95 text-slate-300 font-medium text-base border border-white/5 transition flex items-center justify-center"
              title="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>
            <button
              onClick={calculate}
              className="py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium text-xl border border-emerald-400/30 transition shadow-md shadow-emerald-900/30"
            >
              =
            </button>
          </div>
        </div>

        {/* Desktop Collapsible History Tape Sidebar */}
        {showHistory && (
          <aside className="hidden md:flex w-72 border-l border-white/10 bg-black/40 p-4 flex-col justify-between h-full shrink-0">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  History Tape
                </span>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1 space-y-2 mt-3 pr-1">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No calculations recorded yet
                  </div>
                ) : (
                  history.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setDisplay(item.result)
                        setWaitingForOperand(true)
                        sounds.playClick()
                      }}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] cursor-pointer transition border border-white/5 text-right group relative"
                    >
                      <div className="text-xs text-slate-400 font-mono group-hover:text-slate-300">
                        {item.equation}
                      </div>
                      <div className="text-base font-mono font-medium text-emerald-400">
                        {item.result}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 text-center pt-2 border-t border-white/5">
              Click any entry to reuse result
            </div>
          </aside>
        )}

        {/* Mobile History Tape Bottom Sheet */}
        <MobileBottomSheet
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          title="History Tape"
          className="md:hidden"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs text-slate-400">
                {history.length} calculation(s) recorded
              </span>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No calculations recorded yet
                </div>
              ) : (
                history.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setDisplay(item.result)
                      setWaitingForOperand(true)
                      setShowHistory(false)
                      sounds.playClick()
                    }}
                    className="p-3 rounded-xl bg-white/[0.05] active:bg-white/10 cursor-pointer transition border border-white/10 text-right"
                  >
                    <div className="text-xs text-slate-400 font-mono">
                      {item.equation}
                    </div>
                    <div className="text-lg font-mono font-medium text-emerald-400 mt-0.5">
                      {item.result}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </MobileBottomSheet>
      </div>
    </div>
  )
}
