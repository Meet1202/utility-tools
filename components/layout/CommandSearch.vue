<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useToolRegistry } from '~/composables/useToolRegistry'
import ToolIcon from '~/components/tools/ToolIcon.vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const { tools, search, popularTools } = useToolRegistry()

const searchQuery = ref('')
const selectedIndex = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) {
    return popularTools.value
  }
  return search(searchQuery.value)
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    searchQuery.value = ''
    selectedIndex.value = 0
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

watch(searchResults, () => {
  selectedIndex.value = 0
})

function selectTool(slug: string) {
  emit('close')
  router.push(`/tools/${slug}`)
}

function onKeyDown(e: KeyboardEvent) {
  if (!props.isOpen) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (selectedIndex.value < searchResults.value.length - 1) {
      selectedIndex.value++
    } else {
      selectedIndex.value = 0
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    } else {
      selectedIndex.value = searchResults.value.length - 1
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const target = searchResults.value[selectedIndex.value]
    if (target) {
      selectTool(target.slug)
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md transition-opacity"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all flex flex-col max-h-[80vh]"
      >
        <!-- Search Input Bar -->
        <div class="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <svg class="w-5 h-5 text-slate-400 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>

          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search tools by name, keyword, or action... (e.g. merge, qr, compress)"
            class="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-base sm:text-lg focus:outline-none"
            @keydown="onKeyDown"
          />

          <kbd class="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        <!-- Results List -->
        <div class="overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          <div v-if="!searchQuery.trim()" class="px-3 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Popular Tools
          </div>

          <div
            v-for="(tool, index) in searchResults"
            :key="tool.slug"
            tabindex="0"
            role="button"
            class="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors"
            :class="[
              selectedIndex === index
                ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-100'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200'
            ]"
            @click="selectTool(tool.slug)"
            @mouseenter="selectedIndex = index"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                :class="selectedIndex === index ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
              >
                <ToolIcon :name="tool.icon" :size="18" />
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-sm">{{ tool.name }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {{ tool.category }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                  {{ tool.shortDescription }}
                </p>
              </div>
            </div>

            <svg
              class="w-4 h-4 text-slate-400 shrink-0 ml-2"
              :class="{ 'text-brand-600 dark:text-brand-400': selectedIndex === index }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <!-- Empty search state -->
          <div
            v-if="searchResults.length === 0"
            class="py-12 text-center text-slate-500 dark:text-slate-400"
          >
            <p class="text-sm font-semibold">No matching tools found</p>
            <p class="text-xs mt-1">Try another keyword like "pdf", "image", "json", or "qr"</p>
          </div>
        </div>

        <!-- Footer Hint -->
        <div class="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span><kbd class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">↑</kbd> <kbd class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">↓</kbd> to navigate</span>
            <span><kbd class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">↵</kbd> to open</span>
          </div>
          <span>Client-side local search</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
