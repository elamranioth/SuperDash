import { storageService } from '@/services/storage'

class FavoritesService {
  private key = 'user_favorites'

  async getFavorites(): Promise<Record<string, string[]>> {
    return storageService.get<Record<string, string[]>>(this.key, {
      apps: ['calculator', 'notes', 'timer'],
      currencies: ['AED', 'EUR', 'MAD'],
      notes: [],
      documents: []
    })
  }

  async isFavorite(category: string, id: string): Promise<boolean> {
    const favs = await this.getFavorites()
    return (favs[category] || []).includes(id)
  }

  async toggleFavorite(category: string, id: string): Promise<boolean> {
    const favs = await this.getFavorites()
    const list = favs[category] || []
    const isFav = list.includes(id)
    const updated = isFav ? list.filter(item => item !== id) : [...list, id]
    favs[category] = updated
    await storageService.set(this.key, favs)
    return !isFav
  }
}

export const favoritesService = new FavoritesService()
