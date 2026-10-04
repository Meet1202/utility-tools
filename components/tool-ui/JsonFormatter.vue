<script setup lang="ts">
import { ref, computed } from 'vue'
import { validateJson, formatJson, minifyJson } from '~/utils/dev'
import { useDownload } from '~/composables/useDownload'
import ResultPanel from '~/components/tools/ResultPanel.vue'

const { downloadText } = useDownload()

const inputJson = ref('{\n  "name": "ToolBox",\n  "version": "1.0.0",\n  "private": true,\n  "tags": ["utility", "privacy", "in-browser"],\n  "author": {\n    "role": "Frontend Engineer",\n    "clientSide": true\n  }\n}')
const indentSpaces = ref<2 | 4>(2)
const sortAlphabetical = ref(false)
const formattedOutput = ref('')
const validationError = ref<string | null>(null)
const errorLine = ref<number | null>(null)
const errorCol = ref<number | null>(null)

function runFormat() {
  validationError.value = null
  errorLine.value = null
  errorCol.value = null

  const validation = validateJson(inputJson.value)
  if (!validation.isValid) {
    validationError.value = validation.error || 'Invalid JSON syntax'
    errorLine.value = validation.line || null
    errorCol.value = validation.column || null
    formattedOutput.value = ''
    return
  }

  try {
    formattedOutput.value = formatJson(inputJson.value, indentSpaces.value, sortAlphabetical.value)
  } catch (err: any) {
    validationError.value = err.message
  }
}

function runMinify() {
  validationError.value = null
  const validation = validateJson(inputJson.value)
  if (!validation.isValid) {
    validationError.value = validation.error || 'Invalid JSON syntax'
    return
  }
  try {
    formattedOutput.value = minifyJson(inputJson.value)
  } catch (err: any) {
    validationError.value = err.message
  }
}

function loadSample() {
  inputJson.value = JSON.stringify({
    title: 'ToolBox Utility Suite',
    description: '100% private in-browser online tools',
    stats: {
      totalTools: 20,
      openSource: true,
      offlineSupported: true
    },
    features: ['PDF Tools', 'Image Tools', 'Developer Utilities', 'Financial Calculators']
  }, null, 2)
  runFormat()
}

function clearAll() {
  inputJson.value = ''
  formattedOutput.value = ''
  validationError.value = null
}

function downloadResult() {
  if (formattedOutput.value) {
    downloadText(formattedOutput.value, 'formatted.json', 'application/json')
  }
}

// Auto format initial sample
onMounted(() => {
  runFormat()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Controls Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition-colors"
          @click="runFormat"
        >
          Format JSON
        </button>

        <button
          type="button"
          class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          @click="runMinify"
        >
          Minify
        </button>

        <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

        <!-- Indent selector -->
        <div class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <span>Indent:</span>
          <button
            type="button"
            class="px-2 py-1 rounded-lg font-medium border text-xs"
            :class="indentSpaces === 2 ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-950 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700'"
            @click="indentSpaces = 2; runFormat()"
          >
            2 Spaces
          </button>
          <button
            type="button"
            class="px-2 py-1 rounded-lg font-medium border text-xs"
            :class="indentSpaces === 4 ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-950 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700'"
            @click="indentSpaces = 4; runFormat()"
          >
            4 Spaces
          </button>
        </div>

        <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer ml-1">
          <input
            v-model="sortAlphabetical"
            type="checkbox"
            class="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            @change="runFormat"
          />
          <span>Sort Keys</span>
        </label>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          @click="loadSample"
        >
          Load Sample
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          @click="clearAll"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Error Banner if invalid -->
    <div
      v-if="validationError"
      class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3"
      role="alert"
    >
      <svg class="w-5 h-5 shrink-0 text-rose-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div>
        <p class="font-bold">Syntax Error in JSON</p>
        <p class="mt-0.5 text-xs font-mono">{{ validationError }}</p>
        <p v-if="errorLine" class="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
          Error detected around Line {{ errorLine }}, Column {{ errorCol }}
        </p>
      </div>
    </div>

    <!-- Side-by-Side or Stacked Editors -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <!-- Input -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span class="font-bold uppercase tracking-wider">Raw Input JSON</span>
          <span>{{ inputJson.length }} characters</span>
        </div>
        <textarea
          v-model="inputJson"
          rows="16"
          placeholder="Paste unformatted JSON here..."
          class="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
          @input="runFormat"
        ></textarea>
      </div>

      <!-- Formatted Output Panel -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span class="font-bold uppercase tracking-wider">Formatted Result</span>
          <span v-if="formattedOutput">{{ formattedOutput.length }} characters</span>
        </div>

        <ResultPanel
          title="Formatted JSON"
          :result-text="formattedOutput"
          :show-download="true"
          download-filename="formatted.json"
          empty-title="JSON output will appear here"
          empty-message="Paste or type JSON in the editor to see formatted output in real time."
          @download="downloadResult"
          @reset="clearAll"
        />
      </div>
    </div>
  </div>
</template>
