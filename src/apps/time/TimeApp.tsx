import { useState } from 'react'
import TimerApp from '@/apps/timer/TimerApp'
import FocusApp from '@/apps/focus/FocusApp'
import WorldClockApp from '@/apps/worldclock/WorldClockApp'

export type TimeAppMode = 'timer' | 'focus' | 'world'

interface TimeAppProps {
  initialMode?: TimeAppMode
}

export default function TimeApp({ initialMode = 'timer' }: TimeAppProps) {
  const [activeMode, setActiveMode] = useState<TimeAppMode>(initialMode)

  switch (activeMode) {
    case 'focus':
      return <FocusApp activeTimeMode="focus" onSelectTimeMode={setActiveMode} />
    case 'world':
      return <WorldClockApp activeTimeMode="world" onSelectTimeMode={setActiveMode} />
    case 'timer':
    default:
      return <TimerApp activeTimeMode="timer" onSelectTimeMode={setActiveMode} />
  }
}
