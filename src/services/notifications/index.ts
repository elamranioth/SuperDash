import { NotificationItem } from '@/types'
import { storageService } from '@/services/storage'

type NotificationSubscriber = (notifications: NotificationItem[]) => void

class InternalNotificationService {
  private key = 'internal_notifications'
  private items: NotificationItem[] = []
  private subscribers: Set<NotificationSubscriber> = new Set()

  constructor() {
    this.init()
  }

  private async init() {
    const list = await storageService.get<NotificationItem[]>(this.key, [
      {
        id: 'notif-1',
        title: 'Markets Update',
        message: 'Bitcoin is up +2.45% in the last 24 hours.',
        type: 'info',
        timestamp: Date.now() - 3600000 * 2,
        read: false,
        actionLabel: 'View Markets',
        actionAppId: 'markets'
      },
      {
        id: 'notif-2',
        title: 'Task Due Today',
        message: '3 tasks are scheduled for completion today.',
        type: 'task',
        timestamp: Date.now() - 3600000 * 4,
        read: false,
        actionLabel: 'Open Tasks',
        actionAppId: 'tasks'
      }
    ])
    this.items = list
    this.notify()
  }

  subscribe(callback: NotificationSubscriber): () => void {
    this.subscribers.add(callback)
    callback([...this.items])
    return () => {
      this.subscribers.delete(callback)
    }
  }

  private notify() {
    this.subscribers.forEach(cb => cb([...this.items]))
  }

  getNotifications(): NotificationItem[] {
    return [...this.items]
  }

  getUnreadCount(): number {
    return this.items.filter(n => !n.read).length
  }

  async add(item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): Promise<NotificationItem> {
    const newNotif: NotificationItem = {
      ...item,
      id: 'notif-' + Date.now(),
      timestamp: Date.now(),
      read: false
    }
    this.items = [newNotif, ...this.items].slice(0, 30)
    await storageService.set(this.key, this.items)
    this.notify()
    return newNotif
  }

  async markAsRead(id: string): Promise<void> {
    this.items = this.items.map(n => (n.id === id ? { ...n, read: true } : n))
    await storageService.set(this.key, this.items)
    this.notify()
  }

  async markAllAsRead(): Promise<void> {
    this.items = this.items.map(n => ({ ...n, read: true }))
    await storageService.set(this.key, this.items)
    this.notify()
  }

  async remove(id: string): Promise<void> {
    this.items = this.items.filter(n => n.id !== id)
    await storageService.set(this.key, this.items)
    this.notify()
  }
}

export const notificationService = new InternalNotificationService()
