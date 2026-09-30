import { useState, useEffect, useCallback } from 'react'
import { Collection, CollectionItem } from '@/types'
import {
  collectionsRepository,
  ResolvedCollectionItem
} from '@/services/collections'
import CollectionsHome from './CollectionsHome'
import CollectionDetailView from './CollectionDetailView'
import { sounds } from '@/utils/sound'

interface CollectionsAppProps {
  initialCollectionId?: string
  onOpenApp?: (appId: string, customProps?: Record<string, unknown>) => void
}

export default function CollectionsApp({
  initialCollectionId,
  onOpenApp = () => {}
}: CollectionsAppProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [items, setItems] = useState<CollectionItem[]>([])
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(
    initialCollectionId || null
  )
  const [resolvedItems, setResolvedItems] = useState<ResolvedCollectionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load collections & items
  const loadData = useCallback(async () => {
    try {
      const [cols, allItems] = await Promise.all([
        collectionsRepository.getAllCollections(true),
        collectionsRepository.getAllItems()
      ])
      setCollections(cols)
      setItems(allItems)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // If initialCollectionId changes from outside
  useEffect(() => {
    if (initialCollectionId) {
      setSelectedCollectionId(initialCollectionId)
    }
  }, [initialCollectionId])

  // Load resolved items whenever selectedCollectionId changes
  useEffect(() => {
    if (selectedCollectionId) {
      collectionsRepository.resolveAllInCollection(selectedCollectionId).then(setResolvedItems)
    } else {
      setResolvedItems([])
    }
  }, [selectedCollectionId])

  // Select collection
  const handleSelectCollection = (id: string) => {
    sounds.playClick()
    setSelectedCollectionId(id)
  }

  // Create collection
  const handleCreateCollection = async (
    data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const created = await collectionsRepository.createCollection(data)
    await loadData()
    setSelectedCollectionId(created.id)
  }

  // Toggle favorite on collection
  const handleToggleFavorite = async (id: string) => {
    await collectionsRepository.toggleFavorite(id)
    await loadData()
  }

  // Archive collection
  const handleArchiveCollection = async (id: string) => {
    sounds.playClick()
    const target = collections.find(c => c.id === id)
    if (!target) return
    await collectionsRepository.archiveCollection(id, !target.archived)
    await loadData()
    if (selectedCollectionId === id) {
      setSelectedCollectionId(null)
    }
  }

  // Delete collection
  const handleDeleteCollection = async (id: string) => {
    sounds.playClick()
    await collectionsRepository.deleteCollection(id)
    await loadData()
    setSelectedCollectionId(null)
  }

  // Update collection
  const handleUpdateCollection = async (id: string, updates: Partial<Collection>) => {
    await collectionsRepository.updateCollection(id, updates)
    await loadData()
  }

  // Add item
  const handleAddItem = async (item: Omit<CollectionItem, 'id' | 'addedAt'>) => {
    await collectionsRepository.addItem(item)
    await loadData()
    if (selectedCollectionId) {
      const fresh = await collectionsRepository.resolveAllInCollection(selectedCollectionId)
      setResolvedItems(fresh)
    }
  }

  // Remove item
  const handleRemoveItem = async (itemId: string) => {
    await collectionsRepository.removeItem(itemId)
    await loadData()
    if (selectedCollectionId) {
      const fresh = await collectionsRepository.resolveAllInCollection(selectedCollectionId)
      setResolvedItems(fresh)
    }
  }

  // Toggle item favorite
  const handleToggleFavoriteItem = async (itemId: string) => {
    await collectionsRepository.toggleItemFavorite(itemId)
    await loadData()
    if (selectedCollectionId) {
      const fresh = await collectionsRepository.resolveAllInCollection(selectedCollectionId)
      setResolvedItems(fresh)
    }
  }

  // Move item to section
  const handleMoveItemToSection = async (itemId: string, sectionId?: string) => {
    await collectionsRepository.moveItemToSection(itemId, sectionId)
    await loadData()
    if (selectedCollectionId) {
      const fresh = await collectionsRepository.resolveAllInCollection(selectedCollectionId)
      setResolvedItems(fresh)
    }
  }

  const activeCollection = collections.find(c => c.id === selectedCollectionId)

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-950/40 select-text">
      {activeCollection ? (
        <CollectionDetailView
          collection={activeCollection}
          items={resolvedItems}
          allCollections={collections.filter(c => !c.archived)}
          onBack={() => setSelectedCollectionId(null)}
          onOpenApp={onOpenApp}
          onToggleFavoriteCollection={handleToggleFavorite}
          onArchiveCollection={handleArchiveCollection}
          onDeleteCollection={handleDeleteCollection}
          onUpdateCollection={handleUpdateCollection}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onToggleFavoriteItem={handleToggleFavoriteItem}
          onMoveItemToSection={handleMoveItemToSection}
          onSelectCollection={handleSelectCollection}
        />
      ) : (
        <CollectionsHome
          collections={collections}
          items={items}
          onSelectCollection={handleSelectCollection}
          onCreateCollection={handleCreateCollection}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  )
}
