<script setup lang="ts">
import { ref, computed } from 'vue'
import { calculatePercentage } from '~/utils/calculators'
import CopyButton from '~/components/tools/CopyButton.vue'

type CalcMode = 'whatIsXPercentOfY' | 'xIsWhatPercentOfY' | 'percentageChange' | 'increaseByPercent' | 'decreaseByPercent'

const mode = ref<CalcMode>('whatIsXPercentOfY')
const valX = ref<number>(25)
const valY = ref<number>(200)

const calcResult = computed(() => {
  return calculatePercentage(mode.value, Number(valX.value) || 0, Number(valY.value) || 0)
})

const modeOptions: Array<{ id: CalcMode; label: string; desc: string }> = [
  { id: 'whatIsXPercentOfY', label: 'What is X% of Y?', desc: 'Calculate percentage value' },
  { id: 'xIsWhatPercentOfY', label: 'X is what % of Y?', desc: 'Calculate percentage ratio' },
  { id: 'percentageChange', label: 'Percentage Change (% Increase / Decrease)', desc: 'From old value X to new value Y' },
  { id: 'increaseByPercent', label: 'Increase X by Y%', desc: 'Add percentage to amount' },
  { id: 'decreaseByPercent', label: 'Decrease X by Y%', desc: 'Subtract percentage (Discount)' }
]
</script>

<template>
  <div class="space-y-6 max-w-3xl mx-auto">
    <!-- Mode Selector Pills -->
    <div class="p-2 rounded-2xl glass-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
      <button
        v-for="opt in modeOptions"
        :key="opt.id"
        type="button"
        class="p-3 rounded-xl text-left transition-all"
        :class="[
          mode === opt.id
            ? 'bg-brand-600 text-white shadow-xs'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
        ]"
        @click="mode = opt.id"
      >
        <div class="text-xs font-bold leading-tight">{{ opt.label }}</div>
        <div class="text-[11px] opacity-75 mt-0.5 truncate">{{ opt.desc }}</div>
      </button>
    </div>

    <!-- Interactive Calculator Card -->
    <div class="p-6 sm:p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Input X -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            <span v-if="mode === 'whatIsXPercentOfY'">Percentage (X %)</span>
            <span v-else-if="mode === 'percentageChange'">Initial / Old Value (X)</span>
            <span v-else-if="mode === 'increaseByPercent' || mode === 'decreaseByPercent'">Original Amount (X)</span>
            <span v-else>Value X</span>
          </label>
          <input
            v-model.number="valX"
            type="number"
            step="any"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <!-- Input Y -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            <span v-if="mode === 'whatIsXPercentOfY'">Total Amount (Y)</span>
            <span v-else-if="mode === 'percentageChange'">New / Final Value (Y)</span>
            <span v-else-if="mode === 'increaseByPercent' || mode === 'decreaseByPercent'">Percentage (Y %)</span>
            <span v-else>Total Value (Y)</span>
          </label>
          <input
            v-model.number="valY"
            type="number"
            step="any"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <!-- Result Showcase Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-brand-500/20">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-brand-100">Calculated Result</span>
          <div class="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
            {{ calcResult.result.toLocaleString() }}
            <span v-if="mode === 'xIsWhatPercentOfY' || mode === 'percentageChange'">%</span>
          </div>
          <p class="text-xs font-mono text-brand-200 mt-2">
            Formula: {{ calcResult.formula }}
          </p>
        </div>

        <CopyButton
          :text="`${calcResult.result}`"
          size="lg"
          variant="secondary"
        />
      </div>
    </div>
  </div>
</template>
