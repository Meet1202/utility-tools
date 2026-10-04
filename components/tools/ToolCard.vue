<script setup lang="ts">
import type { ToolItem } from '~/data/tools'
import ToolIcon from './ToolIcon.vue'

const props = defineProps<{
  tool: ToolItem
}>()

const { isFavorite, toggleFavorite } = useFavorites()
const favorited = computed(() => isFavorite(props.tool.slug))

const categoryColorMap: Record<string, { bg: string, text: string, ring: string }> = {
  pdf: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-500/20' },
  image: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20' },
  developer: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-500/20' },
  text: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/20' },
  calculator: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-600 dark:text-sky-400', ring: 'ring-sky-500/20' },
  india: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-500/20' },
  generator: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-500/20' }
}

const colorStyle = computed(() => categoryColorMap[props.tool.category] || categoryColorMap.developer)
</script>

<template>
  <div
    class="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl glass-card hover:shadow-xl hover:-translate-y-1 hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all duration-300 active:scale-[0.99]"
  >
    <div>
      <div class="flex items-start justify-between gap-3 mb-3">
        <div
          class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs"
          :class="[colorStyle.bg, colorStyle.text]"
        >
          <ToolIcon :name="tool.icon" :size="22" />
        </div>

        <button
          type="button"
          :aria-label="favorited ? 'Remove from favorites' : 'Add to favorites'"
          class="p-2 -mr-1 -mt-1 rounded-xl text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          @click.stop.prevent="toggleFavorite(tool.slug)"
        >
          <svg
            viewBox="0 0 24 24"
            class="w-5 h-5 transition-transform active:scale-125"
            :class="favorited ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current stroke-2'"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-2 mb-2">
        <span
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase"
          :class="[colorStyle.bg, colorStyle.text]"
        >
          {{ tool.category }}
        </span>
        <span
          v-if="tool.isFlagship"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-300/50 dark:border-brand-700/50"
        >
          Featured
        </span>
      </div>

      <NuxtLink :to="`/tools/${tool.slug}`" class="block focus:outline-none">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {{ tool.name }}
        </h3>
        <p class="mt-1.5 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {{ tool.shortDescription }}
        </p>
      </NuxtLink>
    </div>

    <div class="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
      <span class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        </svg>
        Client-Side
      </span>

      <NuxtLink
        :to="`/tools/${tool.slug}`"
        class="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold group-hover:translate-x-0.5 transition-transform"
      >
        Open
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14m-7-7 7 7-7 7"/>
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>
