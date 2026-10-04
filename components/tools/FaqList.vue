<script setup lang="ts">
import { ref } from 'vue'
import type { FaqItem } from '~/data/tools'

const props = defineProps<{
  faq: FaqItem[]
}>()

// Open the first question by default
const openIndex = ref<number | null>(0)

function toggle(idx: number) {
  openIndex.value = openIndex.value === idx ? null : idx
}
</script>

<template>
  <div class="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800">
    <div class="mb-6">
      <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="w-2 h-6 bg-brand-500 rounded-full inline-block"></span>
        Frequently Asked Questions
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Everything you need to know about this tool and its local privacy model.
      </p>
    </div>

    <div class="space-y-3">
      <div
        v-for="(item, idx) in faq"
        :key="idx"
        class="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden glass-card transition-colors"
      >
        <button
          type="button"
          :aria-expanded="openIndex === idx"
          class="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          @click="toggle(idx)"
        >
          <span class="text-sm sm:text-base leading-snug">{{ item.question }}</span>
          <svg
            class="w-5 h-5 shrink-0 text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-180 text-brand-600 dark:text-brand-400': openIndex === idx }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <div
          v-show="openIndex === idx"
          class="px-5 pb-4 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60"
        >
          {{ item.answer }}
        </div>
      </div>
    </div>
  </div>
</template>
