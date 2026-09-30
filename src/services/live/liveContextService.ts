import { storageService } from '@/services/storage'

export interface SafeLiveContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  isWeekend: boolean
  dayOfWeek: string
  friendlyDate: string
  greeting: string
  subgreeting: string
  isRaining?: boolean
}

export function getSafeLiveContext(): SafeLiveContext {
  const now = new Date()
  const hour = now.getHours()
  const dayIndex = now.getDay()
  const isWeekend = dayIndex === 0 || dayIndex === 6

  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 'afternoon'
  let greeting = 'You have done enough for a little while.'
  let subgreeting = 'The rest of today does not have to be useful.'

  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning'
    greeting = 'Before the day asks anything from you, take a moment for yourself.'
    subgreeting = 'Don’t use these minutes to plan the day.'
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon'
    greeting = 'You don’t have to wait until tonight to enjoy part of your day.'
    subgreeting = 'Step away from your screen for five minutes.'
  } else if (hour >= 17 && hour < 22) {
    timeOfDay = 'evening'
    greeting = 'The workday may be ending. Your life isn’t.'
    subgreeting = 'The rest of tonight does not have to be productive.'
  } else {
    timeOfDay = 'night'
    greeting = 'Not everything unfinished needs to be finished tonight.'
    subgreeting = 'Nothing important needs to be decided in the dark.'
  }

  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' })
  const friendlyDate = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })

  return {
    timeOfDay,
    isWeekend,
    dayOfWeek,
    friendlyDate,
    greeting,
    subgreeting
  }
}
