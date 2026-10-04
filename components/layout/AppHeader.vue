<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useToolRegistry } from '~/composables/useToolRegistry'
import { useFavorites } from '~/composables/useFavorites'
import ThemeToggle from './ThemeToggle.vue'
import CommandSearch from './CommandSearch.vue'
import ToolIcon from '~/components/tools/ToolIcon.vue'

const { categories: allCategories } = useToolRegistry()
const { favoriteTools, favoritesCount, removeFavorite } = useFavorites()

const isSearchOpen = ref(false)
const isCategoryMenuOpen = ref(false)
const isFavoritesMenuOpen = ref(false)
const isMobileMenuOpen = ref(false)

const categoryDropdownRef = ref<HTMLElement | null>(null)
const favoritesDropdownRef = ref<HTMLElement | null>(null)

let categoryTimeout: ReturnType<typeof setTimeout> | null = null
let favoritesTimeout: ReturnType<typeof setTimeout> | null = null

function openCategoryMenu() {
  if (categoryTimeout) {
    clearTimeout(categoryTimeout)
    categoryTimeout = null
  }
  isCategoryMenuOpen.value = true
}

function scheduleCategoryClose() {
  categoryTimeout = setTimeout(() => {
    isCategoryMenuOpen.value = false
  }, 200)
}

function openFavoritesMenu() {
  if (favoritesTimeout) {
    clearTimeout(favoritesTimeout)
    favoritesTimeout = null
  }
  isFavoritesMenuOpen.value = true
}

function scheduleFavoritesClose() {
  favoritesTimeout = setTimeout(() => {
    isFavoritesMenuOpen.value = false
  }, 200)
}

onClickOutside(categoryDropdownRef, () => {
  isCategoryMenuOpen.value = false
})

onClickOutside(favoritesDropdownRef, () => {
  isFavoritesMenuOpen.value = false
})

function openSearch() {
  isSearchOpen.value = true
}

function closeSearch() {
  isSearchOpen.value = false
}

// Global keyboard shortcut for Ctrl+K / Cmd+K
function onGlobalKey(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    isSearchOpen.value = !isSearchOpen.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKey)
  if (categoryTimeout) clearTimeout(categoryTimeout)
  if (favoritesTimeout) clearTimeout(favoritesTimeout)
})
</script>

<template>
  <header class="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <!-- Brand Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
            Tool<span class="text-brand-600 dark:text-brand-400">Box</span>
          </span>
          <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
            Private & In-Browser
          </span>
        </div>
      </NuxtLink>

      <!-- Desktop Navigation & Categories Dropdown -->
      <nav class="hidden md:flex items-center gap-1 text-sm font-medium">
        <NuxtLink
          to="/tools"
          class="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          All Tools
        </NuxtLink>

        <!-- Category Dropdown with continuous hit area -->
        <div
          ref="categoryDropdownRef"
          class="relative"
          @mouseenter="openCategoryMenu"
          @mouseleave="scheduleCategoryClose"
        >
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            @click="isCategoryMenuOpen = !isCategoryMenuOpen"
          >
            <span>Categories</span>
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': isCategoryMenuOpen }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <!-- Dropdown Menu with zero gap bridge -->
          <div
            v-if="isCategoryMenuOpen"
            class="absolute top-full left-0 pt-1.5 w-60 z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            <div class="rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-2xl border border-slate-200 dark:border-slate-800 ring-1 ring-slate-900/10 dark:ring-white/10">
              <NuxtLink
                v-for="cat in allCategories"
                :key="cat.slug"
                :to="`/category/${cat.slug}`"
                class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                @click="isCategoryMenuOpen = false"
              >
                <span>{{ cat.name }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <NuxtLink
          to="/privacy"
          class="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Privacy Guarantee
        </NuxtLink>
      </nav>

      <!-- Search Trigger & Actions -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Command Search Button -->
        <button
          type="button"
          aria-label="Search tools"
          class="flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-xl text-sm bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
          @click="openSearch"
        >
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <span class="hidden sm:inline">Search tools...</span>
          <span class="sm:hidden">Search</span>
          <kbd class="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
            <span>⌘</span>K
          </kbd>
        </button>

        <!-- Favorites Dropdown Quick-Access with continuous hit area -->
        <div
          ref="favoritesDropdownRef"
          class="relative"
          @mouseenter="openFavoritesMenu"
          @mouseleave="scheduleFavoritesClose"
        >
          <button
            type="button"
            aria-label="Favorite tools"
            class="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            :title="favoritesCount > 0 ? `${favoritesCount} favorite tools` : 'Favorites'"
            @click="isFavoritesMenuOpen = !isFavoritesMenuOpen"
          >
            <svg
              class="w-5 h-5 transition-transform"
              :class="favoritesCount > 0 ? 'fill-rose-500 text-rose-500 scale-105' : 'fill-none stroke-current stroke-2'"
              viewBox="0 0 24 24"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            <!-- Badge Count -->
            <span
              v-if="favoritesCount > 0"
              class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
            >
              {{ favoritesCount }}
            </span>
          </button>

          <!-- Favorites Dropdown Popover with zero gap bridge -->
          <div
            v-if="isFavoritesMenuOpen"
            class="absolute top-full right-0 pt-2 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            <div class="bg-white dark:bg-slate-900 p-3.5 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-2xl ring-1 ring-slate-900/10 dark:ring-white/10">
              <div class="flex items-center justify-between px-2 pb-2.5 mb-2 border-b border-slate-200 dark:border-slate-800">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 fill-rose-500 text-rose-500" viewBox="0 0 24 24">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                  <span class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Favorite Tools ({{ favoritesCount }})
                  </span>
                </div>
                <NuxtLink
                  v-if="favoritesCount > 0"
                  to="/favorites"
                  class="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                  @click="isFavoritesMenuOpen = false"
                >
                  View All
                </NuxtLink>
              </div>

              <!-- List of favorite tools -->
              <div v-if="favoritesCount > 0" class="max-h-72 overflow-y-auto space-y-1">
                <div
                  v-for="tool in favoriteTools"
                  :key="tool.slug"
                  class="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <NuxtLink
                    :to="`/tools/${tool.slug}`"
                    class="flex items-center gap-2.5 min-w-0 flex-1 pr-2"
                    @click="isFavoritesMenuOpen = false"
                  >
                    <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-rose-50 group-hover:text-rose-600 dark:group-hover:bg-rose-950/60 dark:group-hover:text-rose-400 transition-colors">
                      <ToolIcon :name="tool.icon" :size="16" />
                    </div>
                    <div class="truncate">
                      <div class="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-400">
                        {{ tool.name }}
                      </div>
                      <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate capitalize">
                        {{ tool.category }}
                      </div>
                    </div>
                  </NuxtLink>

                  <button
                    type="button"
                    title="Remove from favorites"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    @click.stop="removeFavorite(tool.slug)"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Empty State in Dropdown -->
              <div v-else class="py-6 px-4 text-center">
                <div class="w-10 h-10 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mb-2">
                  <svg class="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </div>
                <p class="text-xs font-semibold text-slate-800 dark:text-slate-200">No favorites yet</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[220px] mx-auto">
                  Click the heart icon on any tool to save it here for fast 1-click access.
                </p>
                <NuxtLink
                  to="/tools"
                  class="inline-block mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
                  @click="isFavoritesMenuOpen = false"
                >
                  Browse Tools
                </NuxtLink>
              </div>

              <!-- Dropdown Footer -->
              <div v-if="favoritesCount > 0" class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px]">
                <span class="text-slate-500 dark:text-slate-400">Stored locally in browser</span>
                <NuxtLink
                  to="/favorites"
                  class="font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                  @click="isFavoritesMenuOpen = false"
                >
                  Manage All
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Theme Toggle -->
        <ThemeToggle />

        <!-- Mobile Menu Hamburger -->
        <button
          type="button"
          aria-label="Toggle menu"
          class="p-2 md:hidden rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line v-if="!isMobileMenuOpen" x1="4" y1="12" x2="20" y2="12"/>
            <line v-if="!isMobileMenuOpen" x1="4" y1="6" x2="20" y2="6"/>
            <line v-if="!isMobileMenuOpen" x1="4" y1="18" x2="20" y2="18"/>
            <path v-else d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Drawer Backdrop Overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 top-16 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
      @click="isMobileMenuOpen = false"
    />

    <!-- Mobile Drawer Content -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden relative z-40 border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3 bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto"
    >
      <!-- Quick Search Bar inside Mobile Drawer -->
      <button
        type="button"
        class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium border border-slate-200 dark:border-slate-700/80 mb-1 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        @click="isMobileMenuOpen = false; openSearch()"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <span>Search all tools...</span>
        </div>
        <kbd class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700">
          ⌘K
        </kbd>
      </button>

      <NuxtLink
        to="/"
        class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        @click="isMobileMenuOpen = false"
      >
        Home
      </NuxtLink>
      <NuxtLink
        to="/tools"
        class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        @click="isMobileMenuOpen = false"
      >
        All Tools
      </NuxtLink>
      <NuxtLink
        to="/favorites"
        class="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        @click="isMobileMenuOpen = false"
      >
        <span class="flex items-center gap-2">
          <svg class="w-4 h-4 text-rose-500 fill-rose-500" viewBox="0 0 24 24">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          Favorite Tools
        </span>
        <span
          v-if="favoritesCount > 0"
          class="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
        >
          {{ favoritesCount }}
        </span>
      </NuxtLink>
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div class="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          Categories
        </div>
        <NuxtLink
          v-for="cat in allCategories"
          :key="cat.slug"
          :to="`/category/${cat.slug}`"
          class="block px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          @click="isMobileMenuOpen = false"
        >
          {{ cat.name }}
        </NuxtLink>
      </div>
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <NuxtLink
          to="/about"
          class="text-xs text-slate-500 hover:underline px-3 py-1"
          @click="isMobileMenuOpen = false"
        >
          About
        </NuxtLink>
        <NuxtLink
          to="/privacy"
          class="text-xs text-slate-500 hover:underline px-3 py-1"
          @click="isMobileMenuOpen = false"
        >
          Privacy
        </NuxtLink>
        <NuxtLink
          to="/contact"
          class="text-xs text-slate-500 hover:underline px-3 py-1"
          @click="isMobileMenuOpen = false"
        >
          Contact
        </NuxtLink>
      </div>
    </div>

    <!-- Command Search Palette Modal -->
    <CommandSearch :is-open="isSearchOpen" @close="closeSearch" />
  </header>
</template>
