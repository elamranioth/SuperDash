import { storageService } from '@/services/storage'

const STORAGE_KEY = 'finance_learn_completed'

export async function getCompletedLessons(): Promise<string[]> {
  try {
    const list = await storageService.get<string[]>(STORAGE_KEY, [])
    return Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Failed to load learn progress:', err)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }
}

export async function saveCompletedLessons(completedIds: string[]): Promise<void> {
  try {
    await storageService.set(STORAGE_KEY, completedIds)
  } catch (err) {
    console.error('Failed to save learn progress via storageService:', err)
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds))
  } catch {
    // Ignore storage quota errors
  }
}

export async function toggleLessonCompleted(
  lessonId: string,
  currentList: string[]
): Promise<string[]> {
  const set = new Set(currentList)
  if (set.has(lessonId)) {
    set.delete(lessonId)
  } else {
    set.add(lessonId)
  }
  const updated = Array.from(set)
  await saveCompletedLessons(updated)
  return updated
}
