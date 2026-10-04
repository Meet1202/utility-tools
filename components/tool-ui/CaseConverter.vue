<script setup lang="ts">
import { ref, computed } from 'vue'
import { convertCase, type TextCase } from '~/utils/text'
import ResultPanel from '~/components/tools/ResultPanel.vue'

const inputText = ref('The quick brown fox jumps over the lazy dog. Developer tools are awesome!')
const selectedCase = ref<TextCase>('title')

const convertedText = computed(() => {
  return convertCase(inputText.value, selectedCase.value)
})

const cases: Array<{ id: TextCase; label: string; preview: string }> = [
  { id: 'upper', label: 'UPPERCASE', preview: 'HELLO WORLD' },
  { id: 'lower', label: 'lowercase', preview: 'hello world' },
  { id: 'title', label: 'Title Case', preview: 'The Quick Brown Fox' },
  { id: 'sentence', label: 'Sentence case', preview: 'First letter capitalized.' },
  { id: 'camel', label: 'camelCase', preview: 'helloWorld' },
  { id: 'pascal', label: 'PascalCase', preview: 'HelloWorld' },
  { id: 'snake', label: 'snake_case', preview: 'hello_world' },
  { id: 'kebab', label: 'kebab-case', preview: 'hello-world' },
  { id: 'constant', label: 'CONSTANT_CASE', preview: 'HELLO_WORLD' }
]

function clearAll() {
  inputText.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- Action buttons for each case -->
    <div class="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
      <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
        Choose Target Casing
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <button
          v-for="c in cases"
          :key="c.id"
          type="button"
          class="p-2.5 rounded-xl text-left border transition-all"
          :class="[
            selectedCase === c.id
              ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
          ]"
          @click="selectedCase = c.id"
        >
          <div class="text-xs font-bold leading-tight">{{ c.label }}</div>
          <div class="text-[10px] opacity-75 mt-0.5 truncate font-mono">{{ c.preview }}</div>
        </button>
      </div>
    </div>

    <!-- Dual Panes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-500 px-1">
          <label class="font-bold uppercase tracking-wider">Input Text</label>
          <button type="button" class="hover:text-rose-600 font-semibold" @click="clearAll">Clear</button>
        </div>
        <textarea
          v-model="inputText"
          rows="10"
          placeholder="Paste or type text to convert..."
          class="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
        ></textarea>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-1">
          Converted Result
        </label>
        <ResultPanel
          title="Converted Text"
          :result-text="convertedText"
          empty-title="Converted text will show here"
          @reset="clearAll"
        />
      </div>
    </div>
  </div>
</template>
