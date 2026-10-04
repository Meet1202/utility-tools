<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import confetti from 'canvas-confetti'
import { useToolRegistry } from '~/composables/useToolRegistry'
import ToolIcon from '~/components/tools/ToolIcon.vue'

const props = withDefaults(defineProps<{
  errorPath?: string
  isNuxtError?: boolean
}>(), {
  errorPath: '',
  isNuxtError: false
})

const emit = defineEmits<{
  (e: 'resolve'): void
}>()

const router = useRouter()
const route = useRoute()
const { tools, search, popularTools } = useToolRegistry()

const query = ref('')
const currentPath = computed(() => props.errorPath || route.path || '')

// Smart "Did you mean?" fuzzy matching algorithm
const suggestedTool = computed(() => {
  const path = currentPath.value.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim()
  if (!path) return null

  const pathWords = path.split(/\s+/).filter(w => w.length > 2)

  // Rank each tool
  let bestTool = null
  let bestScore = 0

  for (const tool of tools.value) {
    let score = 0
    const slugNorm = tool.slug.replace(/-/g, ' ')
    const nameNorm = tool.name.toLowerCase()

    for (const word of pathWords) {
      if (slugNorm.includes(word)) score += 3
      if (nameNorm.includes(word)) score += 2
      if (tool.keywords.some(k => k.toLowerCase().includes(word))) score += 1
      if (tool.category.toLowerCase().includes(word)) score += 1
    }

    if (score > bestScore) {
      bestScore = score
      bestTool = tool
    }
  }

  return bestScore >= 2 ? bestTool : null
})

// Live search results inside 404
const searchResults = computed(() => {
  if (!query.value.trim()) return []
  return search(query.value).slice(0, 6)
})

function triggerCelebration() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  })
  setTimeout(() => {
    if (props.isNuxtError) {
      emit('resolve')
    } else {
      router.push('/')
    }
  }, 450)
}

function goBack() {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

// 4 Quick emergency tools
const emergencyTools = computed(() => {
  const slugs = ['qr-generator', 'image-compressor', 'split-pdf', 'json-formatter']
  return slugs.map(s => tools.value.find(t => t.slug === s)).filter(Boolean)
})
</script>

<template>
  <div class="relative min-h-[75vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20 overflow-hidden">
    <!-- Ambient glowing backdrop effect -->
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-brand-500/20 via-rose-500/10 to-indigo-500/20 blur-3xl rounded-full -z-10 pointer-events-none" />

    <div class="max-w-2xl w-full text-center space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <!-- Radar Sonar Scanner Graphic -->
      <div class="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto flex items-center justify-center">
        <!-- Concentric Sonar Rings -->
        <div class="absolute inset-0 rounded-full border border-brand-500/20 dark:border-brand-400/20 animate-ping opacity-30" />
        <div class="absolute inset-3 rounded-full border border-dashed border-slate-300 dark:border-slate-700 animate-spin duration-10000" />
        <div class="absolute inset-7 rounded-full border border-slate-200 dark:border-slate-800" />

        <!-- Radar Center Disc -->
        <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-rose-500 text-white flex flex-col items-center justify-center shadow-xl shadow-brand-500/25 rotate-6 hover:rotate-0 transition-transform duration-300 cursor-pointer" @click="triggerCelebration">
          <span class="text-2xl sm:text-3xl font-black tracking-tighter">404</span>
          <span class="text-[9px] uppercase tracking-widest opacity-80 font-bold">Lost Tool</span>
        </div>

        <!-- Floating Little Tool Icons -->
        <div class="absolute top-1 right-2 w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-rose-500 animate-bounce duration-1000">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <div class="absolute bottom-1 left-2 w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-brand-500">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </div>
      </div>

      <!-- Heading & Explanation -->
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-3">
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Page Not Found</span>
        </div>

        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          This Tool Slipped Out Of The Box
        </h1>
        <p class="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          The link you followed doesn't exist, was moved, or has a small typo.
          <span v-if="currentPath" class="block font-mono text-xs text-brand-600 dark:text-brand-400 mt-1 break-all">
            {{ currentPath }}
          </span>
        </p>
      </div>

      <!-- Intelligent "Did You Mean?" Finder Banner -->
      <div
        v-if="suggestedTool"
        class="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/80 text-left flex items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
            <ToolIcon :name="suggestedTool.icon" :size="20" />
          </div>
          <div class="truncate">
            <div class="text-xs font-bold text-brand-800 dark:text-brand-300">
              Did you mean to open this tool?
            </div>
            <div class="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {{ suggestedTool.name }}
            </div>
          </div>
        </div>

        <NuxtLink
          :to="`/tools/${suggestedTool.slug}`"
          class="shrink-0 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition-colors"
        >
          Open Tool →
        </NuxtLink>
      </div>

      <!-- Interactive Search Box in 404 -->
      <div class="relative max-w-lg mx-auto">
        <div class="relative flex items-center">
          <svg class="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            v-model="query"
            type="text"
            placeholder="Search our 20+ utilities (e.g. PDF, compress, QR, EMI)..."
            class="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-md transition-shadow"
          />
        </div>

        <!-- Live Instant Search Results Popup -->
        <div
          v-if="searchResults.length > 0"
          class="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-20 text-left divide-y divide-slate-100 dark:divide-slate-800"
        >
          <NuxtLink
            v-for="tool in searchResults"
            :key="tool.slug"
            :to="`/tools/${tool.slug}`"
            class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <ToolIcon :name="tool.icon" :size="16" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-bold text-slate-900 dark:text-white truncate">
                {{ tool.name }}
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {{ tool.shortDescription }}
              </div>
            </div>
            <span class="text-xs font-semibold text-brand-600 dark:text-brand-400">Open →</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Emergency Quick Tools Kit -->
      <div class="space-y-3 pt-2">
        <div class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Or jump into a popular utility:
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-xl mx-auto">
          <NuxtLink
            v-for="tool in emergencyTools"
            :key="tool?.slug"
            :to="`/tools/${tool?.slug}`"
            class="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-md transition-all text-left group"
          >
            <div class="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ToolIcon :name="tool?.icon || 'wrench'" :size="16" />
            </div>
            <div class="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
              {{ tool?.name }}
            </div>
            <div class="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
              {{ tool?.category }}
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Navigation & Action Buttons -->
      <div class="pt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          @click="goBack"
        >
          ← Go Back
        </button>

        <button
          type="button"
          class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          @click="triggerCelebration"
        >
          <span>Return to Homepage</span>
          <span>🎉</span>
        </button>

        <NuxtLink
          to="/contact"
          class="px-5 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
        >
          Report Missing Tool
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
