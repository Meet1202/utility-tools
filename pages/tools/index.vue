<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToolRegistry } from '~/composables/useToolRegistry'
import { useFavorites } from '~/composables/useFavorites'
import ToolCard from '~/components/tools/ToolCard.vue'

const route = useRoute()
const { tools, categories } = useToolRegistry()
const { favoritesCount, isFavorite } = useFavorites()

const selectedCat = ref('all')
const query = ref('')

onMounted(() => {
  if (route.query.filter === 'favorites') {
    selectedCat.value = 'favorites'
  }
})

const filtered = computed(() => {
  return tools.value.filter(t => {
    if (selectedCat.value === 'favorites') {
      if (!isFavorite(t.slug)) return false
    } else if (selectedCat.value !== 'all' && t.category !== selectedCat.value) {
      return false
    }

    const q = query.value.toLowerCase().trim()
    if (!q) return true

    return (
      t.name.toLowerCase().includes(q) ||
      t.shortDescription.toLowerCase().includes(q) ||
      t.keywords.some(k => k.toLowerCase().includes(q))
    )
  })
})

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string) || 'https://everyday-use-tools.vercel.app'
const canonicalUrl = `${siteUrl}/tools`

useSeoMeta({
  title: 'All Online Utility Tools - Complete Directory | ToolBox',
  description: 'Browse our complete collection of 20+ free, fast, in-browser utility tools for PDF manipulation, image editing, developer utilities, and calculators. Zero server uploads.',
  ogTitle: 'All Online Utility Tools - Complete Directory | ToolBox',
  ogDescription: 'Explore all client-side tools with zero server uploads. Fast, private, in-browser utilities.',
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogImage: `${siteUrl}/og-image.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'All Online Utility Tools - Complete Directory | ToolBox',
  twitterDescription: 'Complete collection of free, private, in-browser utilities for developers and creators.',
  twitterImage: `${siteUrl}/og-image.jpg`
})

const toolsJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'All Online Utility Tools',
  description: 'Complete directory of free, private in-browser utilities for PDF, image, developer, text, and financial calculations.',
  url: canonicalUrl,
  isPartOf: {
    '@type': 'WebSite',
    name: 'ToolBox',
    url: siteUrl
  }
}))

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(toolsJsonLd.value))
    }
  ]
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
    <!-- Header -->
    <div class="max-w-3xl mb-8 sm:mb-10">
      <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        All Utility Tools
      </h1>
      <p class="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
        Browse our full catalog of fast, private tools. Every utility executes directly in your browser without uploading files to any server.
      </p>
    </div>

    <!-- Filters and Search Bar -->
    <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-200/80 dark:border-slate-800">
      <!-- Search Input -->
      <div class="relative w-full md:w-80">
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          v-model="query"
          type="text"
          placeholder="Filter tools..."
          class="w-full pl-10 pr-9 py-2 rounded-xl glass-card text-sm text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          v-if="query"
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          @click="query = ''"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Category Filter Chips -->
      <div class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
        <button
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
          :class="[
            selectedCat === 'all'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          ]"
          @click="selectedCat = 'all'"
        >
          All ({{ tools.length }})
        </button>

        <!-- Favorites Filter Chip -->
        <button
          v-if="favoritesCount > 0"
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
          :class="[
            selectedCat === 'favorites'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60'
          ]"
          @click="selectedCat = 'favorites'"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          <span>Favorites ({{ favoritesCount }})</span>
        </button>

        <button
          v-for="cat in categories"
          :key="cat.slug"
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
          :class="[
            selectedCat === cat.slug
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          ]"
          @click="selectedCat = cat.slug"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <ToolCard
        v-for="tool in filtered"
        :key="tool.slug"
        :tool="tool"
      />
    </div>

    <!-- Empty Filter State -->
    <div
      v-if="filtered.length === 0"
      class="p-12 text-center rounded-2xl glass-card text-slate-500 dark:text-slate-400"
    >
      <p class="font-semibold text-base">No tools found matching your search</p>
      <p class="text-sm mt-1">Try clearing your filters to see all available tools.</p>
      <button
        type="button"
        class="mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs"
        @click="selectedCat = 'all'; query = ''"
      >
        Reset Filters
      </button>
    </div>
  </div>
</template>
