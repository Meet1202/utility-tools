<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFavorites } from '~/composables/useFavorites'
import { useToolRegistry } from '~/composables/useToolRegistry'
import ToolCard from '~/components/tools/ToolCard.vue'

const { favoriteTools, favoritesCount, clearFavorites } = useFavorites()
const { popularTools } = useToolRegistry()

const filterQuery = ref('')
const showClearConfirm = ref(false)

const filteredFavorites = computed(() => {
  const q = filterQuery.value.toLowerCase().trim()
  if (!q) return favoriteTools.value

  return favoriteTools.value.filter(tool =>
    tool.name.toLowerCase().includes(q) ||
    tool.shortDescription.toLowerCase().includes(q) ||
    tool.category.toLowerCase().includes(q) ||
    tool.keywords.some(k => k.toLowerCase().includes(q))
  )
})

function confirmClear() {
  clearFavorites()
  showClearConfirm.value = false
}

useSeoMeta({
  title: 'Favorite Tools - Quick Access | ToolBox',
  description: 'Your saved favorite browser utility tools for instant one-click access. Fully client-side, zero tracking.',
  ogTitle: 'Favorite Tools - Quick Access | ToolBox',
  ogDescription: 'Quickly access your bookmarked online utility tools with zero server uploads.',
  robots: 'noindex, nofollow' // user specific local state
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 pb-6 sm:pb-8 border-b border-slate-200/80 dark:border-slate-800">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-3">
          <svg class="w-3.5 h-3.5 fill-rose-500" viewBox="0 0 24 24">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          <span>Personal Bookmarks</span>
        </div>

        <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          Your Favorite Tools
          <span
            v-if="favoritesCount > 0"
            class="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          >
            {{ favoritesCount }}
          </span>
        </h1>

        <p class="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
          Quick 1-click access to your most frequently used utilities. All preferences are preserved privately in your browser's local storage.
        </p>
      </div>

      <!-- Actions -->
      <div v-if="favoritesCount > 0" class="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
        <NuxtLink
          to="/tools"
          class="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
        >
          + Add More Tools
        </NuxtLink>

        <!-- Clear Favorites Trigger -->
        <button
          v-if="!showClearConfirm"
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
          @click="showClearConfirm = true"
        >
          Clear All
        </button>

        <!-- Inline Confirm -->
        <div v-else class="flex items-center gap-2 animate-in fade-in duration-150">
          <span class="text-xs text-rose-600 dark:text-rose-400 font-medium">Clear all?</span>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
            @click="confirmClear"
          >
            Yes, Clear
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            @click="showClearConfirm = false"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Active Favorites Section -->
    <div v-if="favoritesCount > 0" class="mt-8 space-y-6">
      <!-- Search filter if user has more than 3 favorites -->
      <div v-if="favoritesCount > 3" class="max-w-md relative">
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          v-model="filterQuery"
          type="text"
          placeholder="Filter your favorite tools..."
          class="w-full pl-10 pr-4 py-2 rounded-xl glass-card text-sm text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <!-- Tools Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <ToolCard
          v-for="tool in filteredFavorites"
          :key="tool.slug"
          :tool="tool"
        />
      </div>

      <!-- Empty Filter State -->
      <div
        v-if="filteredFavorites.length === 0"
        class="p-10 text-center rounded-2xl glass-card text-slate-500 dark:text-slate-400"
      >
        <p class="font-semibold text-sm">No favorites matched "{{ filterQuery }}"</p>
        <button
          type="button"
          class="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200"
          @click="filterQuery = ''"
        >
          Reset Filter
        </button>
      </div>
    </div>

    <!-- Empty State when user has NO favorites -->
    <div v-else class="mt-12">
      <div class="max-w-xl mx-auto text-center p-8 sm:p-12 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <div class="w-20 h-20 mx-auto rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/60 flex items-center justify-center text-rose-500 shadow-inner">
          <svg class="w-10 h-10 stroke-current stroke-1.5 fill-none animate-bounce" viewBox="0 0 24 24">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </div>

        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            No favorite tools saved yet
          </h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            Whenever you see a tool you like, click the heart icon <span class="inline-flex text-rose-500 font-bold">♥</span> on its card or header to bookmark it here for instant 1-click access!
          </p>
        </div>

        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <NuxtLink
            to="/tools"
            class="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
          >
            Browse All Utilities
          </NuxtLink>
          <NuxtLink
            to="/"
            class="w-full sm:w-auto px-5 py-3 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold transition-colors"
          >
            Go to Home
          </NuxtLink>
        </div>
      </div>

      <!-- Suggested popular tools to jumpstart favorites -->
      <div class="mt-16">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-brand-500 rounded-full inline-block"></span>
          Popular Tools You Might Like
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ToolCard
            v-for="tool in popularTools.slice(0, 4)"
            :key="tool.slug"
            :tool="tool"
          />
        </div>
      </div>
    </div>
  </div>
</template>
