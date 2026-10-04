<script setup lang="ts">
import CopyButton from './CopyButton.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    resultText?: string
    isProcessing?: boolean
    error?: string | null
    emptyTitle?: string
    emptyMessage?: string
    originalSize?: number | null
    resultSize?: number | null
    downloadFilename?: string
    downloadDisabled?: boolean
    showCopy?: boolean
    showDownload?: boolean
  }>(),
  {
    title: 'Output & Results',
    resultText: '',
    isProcessing: false,
    error: null,
    emptyTitle: 'No output generated yet',
    emptyMessage: 'Enter inputs or upload files above to see live results.',
    originalSize: null,
    resultSize: null,
    downloadFilename: 'output.txt',
    downloadDisabled: false,
    showCopy: true,
    showDownload: false
  }
)

const emit = defineEmits<{
  (e: 'download'): void
  (e: 'reset'): void
}>()

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const savedPercent = computed(() => {
  if (!props.originalSize || !props.resultSize || props.originalSize <= props.resultSize) return 0
  return Math.round(((props.originalSize - props.resultSize) / props.originalSize) * 100)
})
</script>

<template>
  <div class="rounded-2xl glass-panel p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200/80 dark:border-slate-800/80">
      <div class="flex items-center gap-2">
        <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {{ title }}
        </h3>

        <!-- Processing spinner -->
        <span
          v-if="isProcessing"
          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 animate-pulse"
        >
          <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Processing in browser...
        </span>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2">
        <slot name="actions">
          <CopyButton
            v-if="showCopy && resultText"
            :text="resultText"
            size="sm"
          />

          <button
            v-if="showDownload"
            type="button"
            :disabled="downloadDisabled || isProcessing"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white shadow-xs transition-colors"
            @click="emit('download')"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>

          <button
            type="button"
            class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset to initial state"
            aria-label="Reset"
            @click="emit('reset')"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        </slot>
      </div>
    </div>

    <!-- Before / After Size Badge if applicable -->
    <div
      v-if="originalSize && resultSize"
      class="mb-4 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-3 text-xs"
    >
      <div class="flex items-center gap-4">
        <div>
          <span class="text-slate-500 dark:text-slate-400">Original: </span>
          <span class="font-semibold text-slate-900 dark:text-white">{{ formatBytes(originalSize) }}</span>
        </div>
        <span class="text-slate-400">→</span>
        <div>
          <span class="text-slate-500 dark:text-slate-400">Optimized: </span>
          <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ formatBytes(resultSize) }}</span>
        </div>
      </div>

      <div v-if="savedPercent > 0" class="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
        <span>↓ {{ savedPercent }}% smaller</span>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3"
      role="alert"
    >
      <svg class="w-5 h-5 shrink-0 text-rose-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div>
        <p class="font-semibold">Operation Failed</p>
        <p class="mt-0.5 text-xs text-rose-600 dark:text-rose-400">{{ error }}</p>
      </div>
    </div>

    <!-- Default Content Slot -->
    <div v-else>
      <slot>
        <!-- Empty State -->
        <div
          v-if="!resultText && !isProcessing"
          class="py-12 px-4 text-center flex flex-col items-center justify-center text-slate-400 dark:text-slate-500"
        >
          <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect width="18" height="18" x="3" y="3" rx="2"/>
              <path d="M3 9h18"/>
              <path d="M9 21V9"/>
            </svg>
          </div>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ emptyTitle }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{{ emptyMessage }}</p>
        </div>

        <!-- Text Result Pre -->
        <div v-else-if="resultText" class="relative">
          <pre
            class="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm overflow-x-auto max-h-96 leading-relaxed selection:bg-brand-600"
          ><code>{{ resultText }}</code></pre>
        </div>
      </slot>
    </div>
  </div>
</template>
