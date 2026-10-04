<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { encodeUrl, decodeUrl, parseQueryParams } from '~/utils/dev'
import ResultPanel from '~/components/tools/ResultPanel.vue'
import CopyButton from '~/components/tools/CopyButton.vue'

const inputUrl = ref('https://example.com/search?category=developer%20tools&sort=asc&page=1&ref=toolbox#section')
const isEncoding = ref(true)
const componentMode = ref(false)
const activeTab = ref<'encode' | 'query'>('encode')

const outputUrl = computed(() => {
  if (!inputUrl.value) return ''
  try {
    return isEncoding.value
      ? encodeUrl(inputUrl.value, componentMode.value)
      : decodeUrl(inputUrl.value, componentMode.value)
  } catch {
    return 'Invalid URL format'
  }
})

const queryParams = computed(() => {
  return parseQueryParams(inputUrl.value)
})

function loadSample() {
  inputUrl.value = 'https://myshop.com/catalog?item=smart%20watch&price_min=100&currency=USD&utm_source=newsletter'
}

function clearAll() {
  inputUrl.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- Sub-navigation tabs -->
    <div class="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          :class="activeTab === 'encode' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
          @click="activeTab = 'encode'"
        >
          Encode / Decode
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          :class="activeTab === 'query' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
          @click="activeTab = 'query'"
        >
          Query Params Inspector ({{ queryParams.length }})
        </button>
      </div>

      <div v-if="activeTab === 'encode'" class="flex items-center gap-3">
        <div class="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            :class="isEncoding ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs' : 'text-slate-500'"
            @click="isEncoding = true"
          >
            Encode
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            :class="!isEncoding ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs' : 'text-slate-500'"
            @click="isEncoding = false"
          >
            Decode
          </button>
        </div>

        <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            v-model="componentMode"
            type="checkbox"
            class="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>Component Mode (encodeURIComponent)</span>
        </label>
      </div>
    </div>

    <!-- MAIN ENCODE / DECODE TAB -->
    <div v-if="activeTab === 'encode'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <label class="font-bold uppercase tracking-wider">Input URL or Text</label>
          <div class="flex gap-2">
            <button type="button" class="hover:text-brand-600" @click="loadSample">Sample</button>
            <button type="button" class="hover:text-rose-600" @click="clearAll">Clear</button>
          </div>
        </div>
        <textarea
          v-model="inputUrl"
          rows="10"
          placeholder="Paste URL or string here..."
          class="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
        ></textarea>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-1">
          {{ isEncoding ? 'URL Encoded Result' : 'Decoded URL' }}
        </label>
        <ResultPanel
          :title="isEncoding ? 'Encoded Result' : 'Decoded Result'"
          :result-text="outputUrl"
          @reset="clearAll"
        />
      </div>
    </div>

    <!-- QUERY PARAMETER INSPECTOR TAB -->
    <div v-else class="space-y-4">
      <div class="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Target URL to Inspect
        </label>
        <input
          v-model="inputUrl"
          type="text"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 font-mono text-xs"
        />
      </div>

      <div class="rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="p-3.5">Parameter Key</th>
              <th class="p-3.5">Decoded Value</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="(p, idx) in queryParams" :key="idx" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td class="p-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">{{ p.key }}</td>
              <td class="p-3.5 font-mono text-slate-700 dark:text-slate-300 break-all">{{ p.value }}</td>
              <td class="p-3.5 text-right">
                <CopyButton :text="p.value" size="sm" variant="ghost" />
              </td>
            </tr>
            <tr v-if="queryParams.length === 0">
              <td colspan="3" class="p-8 text-center text-slate-500">
                No query parameters found in the input URL.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
