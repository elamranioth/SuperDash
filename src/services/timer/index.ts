import { TimerVisualMode, TimerSound, TimerAppMode, PomodoroConfig, IntervalConfig } from '@/types'
import { storageService } from '@/services/storage'

export interface TimerState {
  mode: TimerAppMode
  visualMode: TimerVisualMode
  isRunning: boolean
  isPaused: boolean
  durationSeconds: number
  remainingSeconds: number
  targetTimestamp: number | null
  pausedRemainingSeconds: number | null
  // Pomodoro
  pomodoro: PomodoroConfig & {
    currentRound: number
    isBreak: boolean
    isLongBreak: boolean
  }
  // Interval
  interval: IntervalConfig & {
    currentCycle: number
    isWorkPhase: boolean
  }
  // Stopwatch
  stopwatch: {
    isRunning: boolean
    startTime: number
    elapsedMs: number
    laps: Array<{ id: number; ms: number; splitMs: number }>
  }
}

type TimerSubscriber = (state: TimerState) => void

class CentralizedTimerService {
  private state: TimerState = {
    mode: 'countdown',
    visualMode: 'hourglass',
    isRunning: false,
    isPaused: false,
    durationSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    targetTimestamp: null,
    pausedRemainingSeconds: null,
    pomodoro: {
      focusMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 15,
      roundsTotal: 4,
      autoStart: true,
      currentRound: 1,
      isBreak: false,
      isLongBreak: false
    },
    interval: {
      workMinutes: 45,
      breakMinutes: 10,
      repeatCycles: 4,
      currentCycle: 1,
      isWorkPhase: true
    },
    stopwatch: {
      isRunning: false,
      startTime: 0,
      elapsedMs: 0,
      laps: []
    }
  }

  private subscribers: Set<TimerSubscriber> = new Set()
  private tickInterval: NodeJS.Timeout | null = null
  private stopwatchInterval: NodeJS.Timeout | null = null
  private audioCtx: AudioContext | null = null

  constructor() {
    this.initFromStorage()
  }

  private async initFromStorage() {
    const saved = await storageService.get<Partial<TimerState> | null>('timer_engine_state', null)
    if (saved) {
      if (saved.targetTimestamp && saved.isRunning) {
        const remaining = Math.max(0, Math.ceil((saved.targetTimestamp - Date.now()) / 1000))
        if (remaining > 0) {
          this.state = {
            ...this.state,
            ...saved,
            remainingSeconds: remaining
          }
          this.startTicker()
        } else {
          this.state = {
            ...this.state,
            ...saved,
            isRunning: false,
            remainingSeconds: 0
          }
        }
      } else {
        this.state = { ...this.state, ...saved, isRunning: false }
      }
      this.notify()
    }
  }

  private saveState() {
    storageService.set('timer_engine_state', {
      mode: this.state.mode,
      visualMode: this.state.visualMode,
      durationSeconds: this.state.durationSeconds,
      remainingSeconds: this.state.remainingSeconds,
      targetTimestamp: this.state.targetTimestamp,
      pausedRemainingSeconds: this.state.pausedRemainingSeconds,
      isRunning: this.state.isRunning,
      isPaused: this.state.isPaused,
      pomodoro: this.state.pomodoro,
      interval: this.state.interval
    })
  }

  subscribe(callback: TimerSubscriber): () => void {
    this.subscribers.add(callback)
    callback(this.state)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  getState(): TimerState {
    return { ...this.state }
  }

  private notify() {
    this.subscribers.forEach(cb => cb({ ...this.state }))
  }

  // Audio synthesizer for Timer completion & chimes
  playAlarmSound(soundType: TimerSound = 'soft_bell') {
    if (soundType === 'none') return
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!this.audioCtx) this.audioCtx = new AudioContextClass()
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume()

      const now = this.audioCtx.currentTime

      if (soundType === 'soft_bell') {
        const osc = this.audioCtx.createOscillator()
        const gain = this.audioCtx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(587.33, now) // D5
        osc.frequency.exponentialRampToValueAtTime(293.66, now + 1.2)
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
        osc.connect(gain)
        gain.connect(this.audioCtx.destination)
        osc.start(now)
        osc.stop(now + 1.2)
      } else if (soundType === 'glass_chime') {
        const notes = [1046.5, 1318.5, 1567.98] // C6, E6, G6
        notes.forEach((freq, idx) => {
          const osc = this.audioCtx!.createOscillator()
          const gain = this.audioCtx!.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, now + idx * 0.1)
          gain.gain.setValueAtTime(0.2, now + idx * 0.1)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.8)
          osc.connect(gain)
          gain.connect(this.audioCtx!.destination)
          osc.start(now + idx * 0.1)
          osc.stop(now + idx * 0.1 + 0.8)
        })
      } else if (soundType === 'gong') {
        const osc = this.audioCtx.createOscillator()
        const gain = this.audioCtx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(220, now) // A3
        gain.gain.setValueAtTime(0.4, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0)
        osc.connect(gain)
        gain.connect(this.audioCtx.destination)
        osc.start(now)
        osc.stop(now + 2.0)
      } else {
        // Digital beeps
        for (let i = 0; i < 3; i++) {
          const osc = this.audioCtx.createOscillator()
          const gain = this.audioCtx.createGain()
          osc.type = 'square'
          osc.frequency.setValueAtTime(880, now + i * 0.15)
          gain.gain.setValueAtTime(0.1, now + i * 0.15)
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.1)
          osc.connect(gain)
          gain.connect(this.audioCtx.destination)
          osc.start(now + i * 0.15)
          osc.stop(now + i * 0.15 + 0.1)
        }
      }
    } catch {
      // Audio fallback
    }
  }

  // --- COUNTDOWN / TIMER METHODS ---
  startTimer(durationSeconds?: number) {
    const dur = durationSeconds !== undefined ? durationSeconds : this.state.remainingSeconds
    if (dur <= 0) return

    const now = Date.now()
    const target = now + dur * 1000

    this.state.durationSeconds = durationSeconds !== undefined ? durationSeconds : this.state.durationSeconds
    this.state.targetTimestamp = target
    this.state.remainingSeconds = dur
    this.state.isRunning = true
    this.state.isPaused = false
    this.state.pausedRemainingSeconds = null

    this.startTicker()
    this.saveState()
    this.notify()
  }

  pauseTimer() {
    if (!this.state.isRunning || this.state.isPaused) return
    const remaining = this.calcRemaining()
    this.state.isPaused = true
    this.state.isRunning = false
    this.state.pausedRemainingSeconds = remaining
    this.state.remainingSeconds = remaining
    this.state.targetTimestamp = null

    this.stopTicker()
    this.saveState()
    this.notify()
  }

  resumeTimer() {
    if (!this.state.isPaused || this.state.pausedRemainingSeconds === null) return
    this.startTimer(this.state.pausedRemainingSeconds)
  }

  resetTimer(newDuration?: number) {
    this.stopTicker()
    const dur = newDuration !== undefined ? newDuration : this.state.durationSeconds
    this.state.durationSeconds = dur
    this.state.remainingSeconds = dur
    this.state.isRunning = false
    this.state.isPaused = false
    this.state.targetTimestamp = null
    this.state.pausedRemainingSeconds = null

    this.saveState()
    this.notify()
  }

  addTime(secondsToAdd: number) {
    if (this.state.isRunning && this.state.targetTimestamp) {
      this.state.targetTimestamp += secondsToAdd * 1000
      this.state.durationSeconds += secondsToAdd
      this.state.remainingSeconds = this.calcRemaining()
    } else {
      this.state.remainingSeconds += secondsToAdd
      this.state.durationSeconds += secondsToAdd
    }
    this.saveState()
    this.notify()
  }

  setVisualMode(mode: TimerVisualMode) {
    this.state.visualMode = mode
    this.saveState()
    this.notify()
  }

  setMode(mode: TimerAppMode) {
    this.state.mode = mode
    this.saveState()
    this.notify()
  }

  private calcRemaining(): number {
    if (!this.state.targetTimestamp) return this.state.remainingSeconds
    const diff = Math.ceil((this.state.targetTimestamp - Date.now()) / 1000)
    return Math.max(0, diff)
  }

  private startTicker() {
    this.stopTicker()
    this.tickInterval = setInterval(() => {
      const remaining = this.calcRemaining()
      this.state.remainingSeconds = remaining

      if (remaining <= 0) {
        this.onTimerCompleted()
      } else {
        this.notify()
      }
    }, 200)
  }

  private stopTicker() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
    }
  }

  private onTimerCompleted() {
    this.stopTicker()
    this.state.isRunning = false
    this.state.isPaused = false
    this.state.remainingSeconds = 0
    this.state.targetTimestamp = null

    // Play chime sound
    this.playAlarmSound('glass_chime')

    // Handle Pomodoro session progression
    if (this.state.mode === 'pomodoro') {
      const p = this.state.pomodoro
      if (!p.isBreak && !p.isLongBreak) {
        // Just finished focus session
        if (p.currentRound >= p.roundsTotal) {
          // Transition to Long Break
          p.isLongBreak = true
          p.isBreak = false
          this.state.durationSeconds = p.longBreakMinutes * 60
          this.state.remainingSeconds = this.state.durationSeconds
        } else {
          // Transition to short break
          p.isBreak = true
          this.state.durationSeconds = p.breakMinutes * 60
          this.state.remainingSeconds = this.state.durationSeconds
        }
      } else {
        // Just finished break -> next focus session
        if (p.isLongBreak) {
          p.currentRound = 1
          p.isLongBreak = false
        } else {
          p.currentRound += 1
          p.isBreak = false
        }
        this.state.durationSeconds = p.focusMinutes * 60
        this.state.remainingSeconds = this.state.durationSeconds
      }

      if (p.autoStart) {
        this.startTimer(this.state.durationSeconds)
      }
    }

    this.saveState()
    this.notify()
  }

  // --- STOPWATCH METHODS ---
  startStopwatch() {
    if (this.state.stopwatch.isRunning) return
    const sw = this.state.stopwatch
    sw.isRunning = true
    const startOffset = Date.now() - sw.elapsedMs
    sw.startTime = startOffset

    this.stopwatchInterval = setInterval(() => {
      this.state.stopwatch.elapsedMs = Date.now() - this.state.stopwatch.startTime
      this.notify()
    }, 16)
  }

  pauseStopwatch() {
    if (!this.state.stopwatch.isRunning) return
    this.state.stopwatch.isRunning = false
    if (this.stopwatchInterval) {
      clearInterval(this.stopwatchInterval)
      this.stopwatchInterval = null
    }
    this.notify()
  }

  resetStopwatch() {
    this.pauseStopwatch()
    this.state.stopwatch.elapsedMs = 0
    this.state.stopwatch.laps = []
    this.notify()
  }

  addStopwatchLap() {
    const sw = this.state.stopwatch
    if (!sw.isRunning) return
    const current = sw.elapsedMs
    const prevTotal = sw.laps.length > 0 ? sw.laps[0].ms : 0
    const split = current - prevTotal

    sw.laps = [
      {
        id: sw.laps.length + 1,
        ms: current,
        splitMs: split > 0 ? split : current
      },
      ...sw.laps
    ]
    this.notify()
  }
}

export const timerService = new CentralizedTimerService()
