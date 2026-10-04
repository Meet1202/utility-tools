<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToolRegistry } from '~/composables/useToolRegistry'
import { useRecentTools } from '~/composables/useRecentTools'
import { useFavorites } from '~/composables/useFavorites'
import ToolCard from '~/components/tools/ToolCard.vue'
import ToolIcon from '~/components/tools/ToolIcon.vue'

const { tools, categories, popularTools, getTool } = useToolRegistry()
const { recentSlugs } = useRecentTools()
const { favoriteTools, favoritesCount, isFavorite } = useFavorites()

const selectedCategory = ref<string>('all')
const homeSearchQuery = ref('')

const recentTools = computed(() => {
  return recentSlugs.value
    .map(slug => getTool(slug))
    .filter((t): t is NonNullable<typeof t> => !!t)
    .slice(0, 4)
})

const filteredTools = computed(() => {
  return tools.value.filter(tool => {
    if (selectedCategory.value === 'favorites') {
      if (!isFavorite(tool.slug)) return false
    } else if (selectedCategory.value !== 'all' && tool.category !== selectedCategory.value) {
      return false
    }

    const q = homeSearchQuery.value.toLowerCase().trim()
    if (!q) return true

    const matchesSearch =
      tool.name.toLowerCase().includes(q) ||
      tool.shortDescription.toLowerCase().includes(q) ||
      tool.keywords.some(k => k.toLowerCase().includes(q))

    return matchesSearch
  })
})

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string) || 'https://everyday-use-tools.vercel.app'

useSeoMeta({
  title: 'ToolBox - Fast, Free & Privacy-First Online Utilities',
  description: 'A curated collection of 20+ fast, browser-based online tools for PDF, images, developers, and calculators. All processing happens 100% in your browser.',
  ogTitle: 'ToolBox - Fast, Free & Privacy-First Online Utilities',
  ogDescription: 'Process PDFs, compress images, format JSON, generate QR codes, and calculate finances directly on your device without server uploads.',
  ogType: 'website',
  ogUrl: siteUrl,
  ogImage: `${siteUrl}/og-image.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'ToolBox - Fast, Free & Privacy-First Online Utilities',
  twitterDescription: 'Process PDFs, compress images, format JSON, generate QR codes, and calculate finances directly on your device with 100% privacy.',
  twitterImage: `${siteUrl}/og-image.jpg`
})

useHead({
  link: [{ rel: 'canonical', href: siteUrl }]
})
</script>

<template>
  <div>
    <!-- HERO SECTION -->
    <section class="relative pt-8 pb-12 sm:pt-20 sm:pb-24 overflow-hidden">
      <!-- Background Ambient Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/15 to-indigo-500/15 blur-3xl rounded-full -z-10 pointer-events-none"></div>

      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <!-- Privacy Guarantee Pill -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-5 sm:mb-6 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Zero Server Uploads • 100% In-Browser Execution</span>
        </div>

        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Superfast Online Utilities, <br class="hidden sm:inline" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:via-indigo-400 dark:to-purple-400">
            Completely Private.
          </span>
        </h1>

        <p class="mt-3.5 sm:mt-6 text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Merge PDFs, compress images, format code, generate custom QR codes, and run financial calculators with zero tracking and zero latency.
        </p>

        <!-- Fast Live Search Input in Hero -->
        <div class="mt-6 sm:mt-8 max-w-2xl mx-auto relative">
          <div class="relative flex items-center shadow-lg rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 p-1.5 sm:p-2">
            <svg class="w-5 h-5 text-slate-400 ml-3 mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              v-model="homeSearchQuery"
              type="text"
              placeholder="Find any tool (e.g. merge pdf, compress, qr, json)..."
              class="w-full bg-transparent px-2 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm sm:text-base focus:outline-none"
            />
            <button
              v-if="homeSearchQuery"
              type="button"
              class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
              @click="homeSearchQuery = ''"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 pb-20">
      <!-- CATEGORY TILES -->
      <section>
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-6 bg-brand-500 rounded-full inline-block"></span>
            Browse by Category
          </h2>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.slug"
            :to="`/category/${cat.slug}`"
            class="group p-3.5 sm:p-5 rounded-2xl glass-card hover:border-brand-500/40 dark:hover:border-brand-500/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform">
              <ToolIcon :name="cat.icon" :size="20" />
            </div>
            <h3 class="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors text-sm sm:text-base">
              {{ cat.name }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {{ cat.description }}
            </p>
          </NuxtLink>
        </div>
      </section>

      <!-- FAVORITE TOOLS (If user has favorites) -->
      <ClientOnly>
        <section v-if="favoriteTools.length > 0 && !homeSearchQuery.trim()">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="w-2 h-6 bg-rose-500 rounded-full inline-block"></span>
                Favorite Tools
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                  {{ favoritesCount }}
                </span>
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your personal pinned utilities for fast 1-click access.
              </p>
            </div>
            <NuxtLink
              to="/favorites"
              class="text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              Manage All
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ToolCard
              v-for="tool in favoriteTools.slice(0, 4)"
              :key="tool.slug"
              :tool="tool"
            />
          </div>
        </section>
      </ClientOnly>

      <!-- RECENTLY USED TOOLS (If any) -->
      <ClientOnly>
        <section v-if="recentTools.length > 0">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-2 h-6 bg-amber-500 rounded-full inline-block"></span>
              Recently Used
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ToolCard
              v-for="tool in recentTools"
              :key="tool.slug"
              :tool="tool"
            />
          </div>
        </section>
      </ClientOnly>

      <!-- POPULAR TOOLS -->
      <section v-if="!homeSearchQuery.trim()">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-2 h-6 bg-brand-600 rounded-full inline-block"></span>
              Popular Tools
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Top visited utilities by developers and creators daily.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ToolCard
            v-for="tool in popularTools.slice(0, 6)"
            :key="tool.slug"
            :tool="tool"
          />
        </div>
      </section>

      <!-- FULL TOOL DIRECTORY WITH CATEGORY FILTER CHIPS -->
      <section id="all-tools">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-2 h-6 bg-purple-500 rounded-full inline-block"></span>
              All Utilities
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Showing {{ filteredTools.length }} client-side tools
            </p>
          </div>

          <!-- Category filter chips -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              type="button"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
              :class="[
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              ]"
              @click="selectedCategory = 'all'"
            >
              All ({{ tools.length }})
            </button>

            <!-- Favorites Chip (If any) -->
            <button
              v-if="favoritesCount > 0"
              type="button"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
              :class="[
                selectedCategory === 'favorites'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60'
              ]"
              @click="selectedCategory = 'favorites'"
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
                selectedCategory === cat.slug
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              ]"
              @click="selectedCategory = cat.slug"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Tool Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ToolCard
            v-for="tool in filteredTools"
            :key="tool.slug"
            :tool="tool"
          />
        </div>

        <!-- Empty search filter -->
        <div
          v-if="filteredTools.length === 0"
          class="p-12 text-center rounded-2xl glass-card text-slate-500 dark:text-slate-400"
        >
          <p class="font-semibold text-base">No tools matched your filter</p>
          <p class="text-sm mt-1">Try resetting the category filter or searching for another term.</p>
          <button
            type="button"
            class="mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs"
            @click="selectedCategory = 'all'; homeSearchQuery = ''"
          >
            Clear Filters
          </button>
        </div>
      </section>

      <!-- PRIVACY PROMISE BANNER -->
      <section class="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative overflow-hidden border border-indigo-900/50 shadow-xl">
        <div class="max-w-3xl relative z-10 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <span>The Privacy Guarantee</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Files never leave your computer. Period.
          </h2>

          <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
            Unlike other conversion websites that upload your confidential PDFs, photos, and proprietary code to unknown remote servers, ToolBox does 100% of the processing locally inside your web browser sandbox using modern WebAssembly, Canvas, and Web Crypto APIs.
          </p>

          <div class="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              No file upload endpoints
            </span>
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Zero user data stored
            </span>
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Works fully offline
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
