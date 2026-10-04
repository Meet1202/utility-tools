<script setup lang="ts">
import type { ToolItem } from '~/data/tools'
import ToolCard from './ToolCard.vue'

defineProps<{
  tools: ToolItem[]
}>()
</script>

<template>
  <div v-if="tools && tools.length > 0" class="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span class="w-2 h-6 bg-brand-500 rounded-full inline-block"></span>
          Related Tools
        </h2>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Handy utilities frequently used alongside this tool.
        </p>
      </div>

      <NuxtLink
        to="/tools"
        class="text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
      >
        View All
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14m-7-7 7 7-7 7"/>
        </svg>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <ToolCard
        v-for="relTool in tools"
        :key="relTool.slug"
        :tool="relTool"
      />
    </div>
  </div>
</template>
