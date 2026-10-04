<script setup lang="ts">
import { ref, computed } from 'vue'
import { countText, type TextStats } from '~/utils/text'
import CopyButton from '~/components/tools/CopyButton.vue'

const text = ref('ToolBox is a fast, free, and privacy-first collection of online utility tools. All file processing and calculations run 100% locally in your web browser. No files are uploaded to any server, guaranteeing maximum speed and privacy.')

const stats = computed<TextStats>(() => countText(text.value))

const statsReport = computed(() => {
  const s = stats.value
  return `Word Count: ${s.words}\nCharacters: ${s.characters}\nCharacters (No Spaces): ${s.charactersNoSpaces}\nSentences: ${s.sentences}\nParagraphs: ${s.paragraphs}\nEstimated Reading Time: ${s.readingTimeMinutes} min`
})

function clearText() {
  text.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- Stat Cards Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      <div class="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 text-center">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Words</span>
        <p class="text-2xl sm:text-3xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">
          {{ stats.words.toLocaleString() }}
        </p>
      </div>

      <div class="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 text-center">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Characters</span>
        <p class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          {{ stats.characters.toLocaleString() }}
        </p>
      </div>

      <div class="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 text-center">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">No Spaces</span>
        <p class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          {{ stats.charactersNoSpaces.toLocaleString() }}
        </p>
      </div>

      <div class="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 text-center">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentences</span>
        <p class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          {{ stats.sentences.toLocaleString() }}
        </p>
      </div>

      <div class="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paragraphs</span>
        <p class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          {{ stats.paragraphs.toLocaleString() }}
        </p>
      </div>
    </div>

    <!-- Reading / Speaking times -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-4 rounded-xl glass-panel flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <p class="text-xs text-slate-500">Estimated Reading Time</p>
            <p class="font-bold text-slate-900 dark:text-white text-sm">~{{ stats.readingTimeMinutes }} min (200 wpm)</p>
          </div>
        </div>
      </div>

      <div class="p-4 rounded-xl glass-panel flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
          </div>
          <div>
            <p class="text-xs text-slate-500">Estimated Speaking Time</p>
            <p class="font-bold text-slate-900 dark:text-white text-sm">~{{ stats.speakingTimeMinutes }} min (130 wpm)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Textarea -->
    <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-3">
      <div class="flex items-center justify-between text-xs text-slate-500 px-1">
        <span class="font-bold uppercase tracking-wider">Input Text</span>
        <div class="flex items-center gap-2">
          <CopyButton :text="statsReport" label="Copy Stats Report" size="sm" variant="ghost" />
          <button type="button" class="hover:text-rose-600 text-xs font-semibold" @click="clearText">Clear</button>
        </div>
      </div>

      <textarea
        v-model="text"
        rows="10"
        placeholder="Type or paste your text here to count..."
        class="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
      ></textarea>
    </div>

    <!-- Keyword Density Frequency Breakdown -->
    <div v-if="stats.keywordDensity.length > 0" class="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-3">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
        Top Keyword Density (Excluding Stop Words)
      </h3>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          v-for="kw in stats.keywordDensity"
          :key="kw.word"
          class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-xs"
        >
          <span class="font-medium text-slate-800 dark:text-slate-200 truncate">{{ kw.word }}</span>
          <span class="font-bold text-brand-600 dark:text-brand-400 shrink-0 ml-1.5">{{ kw.count }} ({{ kw.percent }}%)</span>
        </div>
      </div>
    </div>
  </div>
</template>
