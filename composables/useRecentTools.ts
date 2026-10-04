import { useLocalStorage } from '@vueuse/core'

export function useRecentTools() {
  const recentSlugs = useLocalStorage<string[]>('utility_tools_recents', [])

  function addRecent(slug: string) {
    if (!slug) return
    // Remove if already present so it moves to front
    const filtered = recentSlugs.value.filter(s => s !== slug)
    // Prepend and cap at 8
    recentSlugs.value = [slug, ...filtered].slice(0, 8)
  }

  function clearRecents() {
    recentSlugs.value = []
  }

  return {
    recentSlugs,
    addRecent,
    clearRecents
  }
}
