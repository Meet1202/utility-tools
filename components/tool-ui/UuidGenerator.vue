<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { generateUuids } from '~/utils/crypto'
import { useDownload } from '~/composables/useDownload'
import CopyButton from '~/components/tools/CopyButton.vue'

const { downloadText } = useDownload()

const count = ref(5)
const uppercase = ref(false)
const hyphens = ref(true)
const braces = ref(false)
const generatedList = ref<string[]>([])

function generate() {
  generatedList.value = generateUuids({
    count: count.value,
    uppercase: uppercase.value,
    hyphens: hyphens.value,
    braces: braces.value
  })
}

function downloadAll() {
  if (generatedList.value.length > 0) {
    downloadText(generatedList.value.join('\n'), 'uuids.txt')
  }
}

onMounted(() => {
  generate()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Controls Bar -->
    <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        <!-- Count -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Quantity: {{ count }}
          </label>
          <input
            v-model.number="count"
            type="range"
            min="1"
            max="100"
            class="w-full accent-brand-600"
            @input="generate"
          />
        </div>

        <!-- Options -->
        <div class="flex items-center gap-4 lg:col-span-2">
          <label class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
            <input v-model="uppercase" type="checkbox" class="rounded border-slate-300 text-brand-600" @change="generate" />
            <span>Uppercase</span>
          </label>

          <label class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
            <input v-model="hyphens" type="checkbox" class="rounded border-slate-300 text-brand-600" @change="generate" />
            <span>Include Hyphens</span>
          </label>

          <label class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
            <input v-model="braces" type="checkbox" class="rounded border-slate-300 text-brand-600" @change="generate" />
            <span>Braces { }</span>
          </label>
        </div>

        <!-- Action button -->
        <div class="text-right">
          <button
            type="button"
            class="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all active:scale-95"
            @click="generate"
          >
            Regenerate UUIDs
          </button>
        </div>
      </div>
    </div>

    <!-- Output List -->
    <div class="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
          Generated {{ generatedList.length }} UUID{{ generatedList.length > 1 ? 's' : '' }} (v4)
        </span>
        <div class="flex items-center gap-2">
          <CopyButton
            :text="generatedList.join('\n')"
            label="Copy All"
            size="sm"
          />
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            @click="downloadAll"
          >
            Download .txt
          </button>
        </div>
      </div>

      <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
        <div
          v-for="(id, idx) in generatedList"
          :key="idx"
          class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 font-mono text-xs sm:text-sm"
        >
          <span class="text-slate-900 dark:text-slate-100 font-semibold select-all">{{ id }}</span>
          <CopyButton :text="id" variant="icon" size="sm" />
        </div>
      </div>
    </div>
  </div>
</template>
