import { storageService } from '@/services/storage'

class RecentAppsService {
  private key = 'recent_apps'

  async getRecentApps(): Promise<string[]> {
    return storageService.get<string[]>(this.key, ['notes', 'calculator', 'timer', 'tasks'])
  }

  async recordAppLaunch(appId: string): Promise<string[]> {
    const list = await this.getRecentApps()
    const filtered = list.filter(id => id !== appId)
    const updated = [appId, ...filtered].slice(0, 8)
    await storageService.set(this.key, updated)
    return updated
  }

  async clearRecent(): Promise<void> {
    await storageService.set(this.key, [])
  }
}

export const recentAppsService = new RecentAppsService()
