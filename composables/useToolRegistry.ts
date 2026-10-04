import { computed } from 'vue'
import { TOOLS, CATEGORIES, getToolBySlug, getToolsByCategory, getPopularTools, searchTools, type ToolItem, type CategoryItem } from '~/data/tools'

export function useToolRegistry() {
  const allTools = computed(() => TOOLS)
  const categories = computed(() => CATEGORIES)
  const popularTools = computed(() => getPopularTools())
  const flagshipTool = computed(() => TOOLS.find(t => t.isFlagship) || TOOLS[0])

  function getTool(slug: string): ToolItem | undefined {
    return getToolBySlug(slug)
  }

  function getCategoryTools(category: string): ToolItem[] {
    return getToolsByCategory(category)
  }

  function search(query: string): ToolItem[] {
    return searchTools(query)
  }

  function getRelatedTools(slug: string, limit = 4): ToolItem[] {
    const tool = getToolBySlug(slug)
    if (!tool) return []
    const related = tool.relatedSlugs
      .map(s => getToolBySlug(s))
      .filter((t): t is ToolItem => !!t)

    if (related.length < limit) {
      const sameCategory = getToolsByCategory(tool.category)
        .filter(t => t.slug !== slug && !related.some(r => r.slug === t.slug))
      related.push(...sameCategory)
    }

    return related.slice(0, limit)
  }

  return {
    tools: allTools,
    categories,
    popularTools,
    flagshipTool,
    getTool,
    getCategoryTools,
    search,
    getRelatedTools
  }
}
