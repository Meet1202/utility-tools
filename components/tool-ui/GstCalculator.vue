<script setup lang="ts">
import { ref, computed } from 'vue'
import { calculateGst, type GstResult } from '~/utils/calculators'
import CopyButton from '~/components/tools/CopyButton.vue'

const amount = ref<number>(10000)
const isInclusive = ref<boolean>(false) // false = Add GST (exclusive), true = Remove GST (inclusive)
const selectedRate = ref<number>(18)
const customRate = ref<number | ''>('')

const activeRate = computed(() => {
  if (customRate.value !== '') {
    return Number(customRate.value) || 0
  }
  return selectedRate.value
})

const gstData = computed<GstResult>(() => {
  return calculateGst(Number(amount.value) || 0, activeRate.value, isInclusive.value)
})

const presetRates = [0, 5, 12, 18, 28]

function setPreset(rate: number) {
  customRate.value = ''
  selectedRate.value = rate
}

const copySummary = computed(() => {
  const d = gstData.value
  return `Base Amount: ₹${d.netAmount}\nGST (${d.ratePercent}%): ₹${d.gstAmount} (CGST: ₹${d.cgstAmount}, SGST: ₹${d.sgstAmount})\nTotal Gross Amount: ₹${d.grossAmount}`
})
</script>

<template>
  <div class="space-y-8 max-w-4xl mx-auto">
    <div class="p-6 sm:p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <!-- Operation Mode Toggle -->
      <div class="flex items-center justify-center">
        <div class="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 inline-flex">
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all"
            :class="[!isInclusive ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400']"
            @click="isInclusive = false"
          >
            Add GST (Exclusive)
          </button>
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all"
            :class="[isInclusive ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400']"
            @click="isInclusive = true"
          >
            Remove GST (Inclusive)
          </button>
        </div>
      </div>

      <!-- Amount Input -->
      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          {{ isInclusive ? 'Total / Billed Amount (₹, including GST)' : 'Base / Net Amount (₹, excluding GST)' }}
        </label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
          <input
            v-model.number="amount"
            type="number"
            min="0"
            step="any"
            class="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xl font-extrabold focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <!-- Tax Slab Presets -->
      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          GST Council Tax Slabs
        </label>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <button
            v-for="rate in presetRates"
            :key="rate"
            type="button"
            class="py-2.5 px-3 rounded-xl border text-center font-bold text-sm transition-all"
            :class="[
              customRate === '' && selectedRate === rate
                ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                : 'bg-white/70 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50'
            ]"
            @click="setPreset(rate)"
          >
            {{ rate }}%
          </button>

          <!-- Custom rate button / input -->
          <div class="relative">
            <input
              v-model="customRate"
              type="number"
              placeholder="Custom %"
              class="w-full h-full py-2 px-2.5 rounded-xl border text-center font-bold text-xs bg-white/70 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      <!-- Summary Display -->
      <div class="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-xl space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Final Total (Gross)</span>
            <div class="text-3xl sm:text-4xl font-extrabold text-white mt-0.5">
              ₹ {{ gstData.grossAmount.toLocaleString() }}
            </div>
          </div>
          <CopyButton :text="copySummary" label="Copy Breakdown" size="md" variant="secondary" />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div class="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
            <span class="text-slate-400 font-sans block">Net Amount</span>
            <span class="text-base font-bold text-white mt-1 block">₹ {{ gstData.netAmount.toLocaleString() }}</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
            <span class="text-slate-400 font-sans block">Total GST ({{ gstData.ratePercent }}%)</span>
            <span class="text-base font-bold text-brand-400 mt-1 block">₹ {{ gstData.gstAmount.toLocaleString() }}</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
            <span class="text-slate-400 font-sans block">CGST ({{ gstData.ratePercent / 2 }}%)</span>
            <span class="text-base font-bold text-amber-400 mt-1 block">₹ {{ gstData.cgstAmount.toLocaleString() }}</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
            <span class="text-slate-400 font-sans block">SGST ({{ gstData.ratePercent / 2 }}%)</span>
            <span class="text-base font-bold text-amber-400 mt-1 block">₹ {{ gstData.sgstAmount.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
