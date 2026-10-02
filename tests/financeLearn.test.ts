import { describe, it, expect } from 'vitest'
import {
  LEARN_GROUPS,
  ALL_LEARN_LESSONS,
  LESSONS_BY_GROUP,
  LESSON_MAP,
  GROUP_MAP,
  getLessonOfTheDay
} from '../src/apps/finance/learn/data'
import { toggleLessonCompleted } from '../src/apps/finance/learn/learnStorage'

describe('Finance Learn Micro-Learning Module', () => {
  it('contains exactly 14 learning groups', () => {
    expect(LEARN_GROUPS).toHaveLength(14)
    const expectedGroups = [
      'money-basics',
      'personal-finance',
      'banking-credit',
      'investing',
      'stock-market',
      'etfs-funds',
      'bonds-fixed-income',
      'crypto-digital-assets',
      'business-finance',
      'economics',
      'risk-insurance',
      'real-estate-finance',
      'financial-statements',
      'advanced-finance'
    ]
    expectedGroups.forEach(id => {
      expect(GROUP_MAP.has(id)).toBe(true)
    })
  })

  it('contains over 300 total 1-minute micro-lessons', () => {
    expect(ALL_LEARN_LESSONS.length).toBeGreaterThanOrEqual(300)
    expect(ALL_LEARN_LESSONS.length).toBe(335)
  })

  it('validates that every lesson has question, explanation, example, and whyItMatters', () => {
    ALL_LEARN_LESSONS.forEach(lesson => {
      expect(lesson.id).toBeTruthy()
      expect(lesson.groupId).toBeTruthy()
      expect(GROUP_MAP.has(lesson.groupId)).toBe(true)
      expect(lesson.question.trim().length).toBeGreaterThan(5)
      expect(lesson.explanation.trim().length).toBeGreaterThan(15)
      expect(lesson.example.trim().length).toBeGreaterThan(10)
      expect(lesson.whyItMatters.trim().length).toBeGreaterThan(10)
    })
  })

  it('groups contain appropriate volume of lessons', () => {
    LEARN_GROUPS.forEach(group => {
      const lessons = LESSONS_BY_GROUP[group.id]
      expect(lessons).toBeDefined()
      expect(lessons.length).toBeGreaterThanOrEqual(20)
    })
  })

  it('returns a valid daily lesson from getLessonOfTheDay', () => {
    const daily = getLessonOfTheDay()
    expect(daily).toBeDefined()
    expect(LESSON_MAP.has(daily.id)).toBe(true)
  })

  it('toggles lesson completed status properly', async () => {
    let list: string[] = []
    list = await toggleLessonCompleted('mb-what-is-money', list)
    expect(list).toContain('mb-what-is-money')

    list = await toggleLessonCompleted('mb-what-is-money', list)
    expect(list).not.toContain('mb-what-is-money')
  })
})
