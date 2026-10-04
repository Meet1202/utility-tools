import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { getToolBySlug, type ToolItem } from '~/data/tools'

export function useFavorites() {
  const favorites = useLocalStorage<string[]>('utility_tools_favorites', [])

  const favoriteTools = computed<ToolItem[]>(() => {
    return favorites.value
      .map(slug => getToolBySlug(slug))
      .filter((t): t is ToolItem => !!t)
  })

  const favoritesCount = computed(() => favorites.value.length)

  function toggleFavorite(slug: string) {
    const index = favorites.value.indexOf(slug)
    if (index === -1) {
      favorites.value.push(slug)
    } else {
      favorites.value.splice(index, 1)
    }
  }

  function removeFavorite(slug: string) {
    const index = favorites.value.indexOf(slug)
    if (index !== -1) {
      favorites.value.splice(index, 1)
    }
  }

  function clearFavorites() {
    favorites.value = []
  }

  function isFavorite(slug: string): boolean {
    return favorites.value.includes(slug)
  }

  return {
    favorites,
    favoriteTools,
    favoritesCount,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
    isFavorite
  }
}

