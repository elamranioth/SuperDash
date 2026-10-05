import { useState } from 'react'
import {
  Plus,
  Droplet,
  Settings2,
  Check
} from 'lucide-react'
import { WaterTrackerConfig } from '@/types/wellness'
import { sounds } from '@/utils/sound'
import GlassPanel from '@/components/LiquidGlass/GlassPanel'

interface WaterTrackerWidgetProps {
  config: WaterTrackerConfig
  onAddGlass: (ml?: number) => void
  onUpdateGoal: (targetMl: number, glassSizeMl: number) => void
}

const GLASS_SIZES = [200, 250, 330, 500]

export default function WaterTrackerWidget({
  config,
  onAddGlass,
  onUpdateGoal
}: WaterTrackerWidgetProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [target, setTarget] = useState(config.dailyTargetMl || 2000)
  const [glassSize, setGlassSize] = useState(config.glassSizeMl || 250)

  const progressPercent = Math.min(100, Math.round((config.currentMl / (config.dailyTargetMl || 2000)) * 100))
  const currentLitres = (config.currentMl / 1000).toFixed(1)
  const targetLitres = ((config.dailyTargetMl || 2000) / 1000).toFixed(1)

  const handleSave = () => {
    sounds.playSuccess()
    onUpdateGoal(target, glassSize)
    setIsEditing(false)
  }

  return (
    <GlassPanel intensity="subtle" className="p-4 rounded-2xl border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">Water Intake</h4>
            <span className="text-[10px] text-slate-400 font-mono">
              💧 {currentLitres} L / {targetLitres} L ({progressPercent}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sounds.playSuccess()
              onAddGlass()
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium text-xs shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+{config.glassSizeMl || 250} ml</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            title="Adjust water goals"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Mini Settings Drawer */}
      {isEditing && (
        <div className="pt-3 border-t border-white/10 space-y-2 animate-in fade-in">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Daily Target (ml)</label>
              <input
                type="number"
                step="250"
                min="500"
                max="5000"
                value={target}
                onChange={e => setTarget(parseInt(e.target.value, 10) || 2000)}
                className="w-full px-2.5 py-1 rounded-lg bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Glass Size</label>
              <select
                value={glassSize}
                onChange={e => setGlassSize(parseInt(e.target.value, 10) || 250)}
                className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-sky-400"
              >
                {GLASS_SIZES.map(sz => (
                  <option key={sz} value={sz}>{sz} ml</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSave}
              className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 transition"
            >
              <Check className="w-3 h-3" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      )}
    </GlassPanel>
  )
}
