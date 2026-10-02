export interface LearnLesson {
  id: string
  groupId: string
  question: string
  explanation: string
  example: string
  whyItMatters: string
}

export interface LearnGroup {
  id: string
  name: string
  iconName: string
  description: string
  color: string
}

export interface LearnProgress {
  completedLessonIds: string[]
  lastViewedLessonId?: string
}
