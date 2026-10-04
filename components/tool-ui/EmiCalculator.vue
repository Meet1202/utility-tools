<script setup lang="ts">
import { ref, computed } from 'vue'
import { calculateEmi, type EmiResult } from '~/utils/calculators'
import { useDownload } from '~/composables/useDownload'
import CopyButton from '~/components/tools/CopyButton.vue'

const { downloadText } = useDownload()

const principal = ref(1000000)
const annualRate = ref(8.5)
const tenureYears = ref(5)
const tenureUnit = ref<'years' | 'months'>('years')
const tenureMonthsInput = ref(60)

const totalTenureMonths = computed(() => {
  return tenureUnit.value === 'years' ? tenureYears.value * 12 : tenureMonthsInput.value
})

const emiData = computed<EmiResult>(() => {
  return calculateEmi(principal.value, annualRate.value, totalTenureMonths.value)
})

function exportCsv() {
  const rows = ['Month,Principal Paid,Interest Paid,Remaining Balance']
  for (const s of emiData.value.schedule) {
    rows.push(`${s.month},${s.principalPaid},${s.interestPaid},${s.balance}`)
  }
  downloadText(rows.join('\n'), 'emi_amortization_schedule.csv', 'text/csv;charset=utf-8')
}
</script>

<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- INPUTS (7 Cols) -->
      <div class="lg:col-span-7 p-6 sm:p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-6">
        <!-- Principal -->
        <div>
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            <span>Loan Amount (₹ / $)</span>
            <span class="text-sm font-mono text-brand-600 dark:text-brand-400 font-extrabold">
              {{ principal.toLocaleString() }}
            </span>
          </div>
          <input
            v-model.number="principal"
            type="number"
            min="10000"
            max="100000000"
            step="10000"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 font-mono text-sm font-bold"
          />
          <input
            v-model.number="principal"
            type="range"
            min="50000"
            max="20000000"
            step="25000"
            class="w-full accent-brand-600 mt-2"
          />
        </div>

        <!-- Interest Rate -->
        <div>
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            <span>Interest Rate (% per annum)</span>
            <span class="text-sm font-mono text-brand-600 dark:text-brand-400 font-extrabold">
              {{ annualRate }}%
            </span>
          </div>
          <input
            v-model.number="annualRate"
            type="number"
            step="0.1"
            min="1"
            max="30"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 font-mono text-sm font-bold"
          />
          <input
            v-model.number="annualRate"
            type="range"
            min="5"
            max="20"
            step="0.1"
            class="w-full accent-brand-600 mt-2"
          />
        </div>

        <!-- Tenure -->
        <div>
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            <span>Loan Tenure</span>
            <div class="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                class="px-2 py-0.5 rounded text-[11px] font-semibold"
                :class="tenureUnit === 'years' ? 'bg-white dark:bg-slate-900 text-brand-600' : 'text-slate-500'"
                @click="tenureUnit = 'years'"
              >
                Years
              </button>
              <button
                type="button"
                class="px-2 py-0.5 rounded text-[11px] font-semibold"
                :class="tenureUnit === 'months' ? 'bg-white dark:bg-slate-900 text-brand-600' : 'text-slate-500'"
                @click="tenureUnit = 'months'"
              >
                Months
              </button>
            </div>
          </div>

          <div v-if="tenureUnit === 'years'">
            <input
              v-model.number="tenureYears"
              type="number"
              min="1"
              max="35"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 font-mono text-sm font-bold"
            />
            <input
              v-model.number="tenureYears"
              type="range"
              min="1"
              max="30"
              class="w-full accent-brand-600 mt-2"
            />
          </div>
          <div v-else>
            <input
              v-model.number="tenureMonthsInput"
              type="number"
              min="6"
              max="360"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 font-mono text-sm font-bold"
            />
          </div>
        </div>
      </div>

      <!-- RESULTS & SUMMARY (5 Cols) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-xl space-y-6 border border-slate-800">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly EMI</span>
            <div class="text-3xl sm:text-4xl font-extrabold text-brand-400 mt-1">
              ₹ {{ emiData.monthlyEmi.toLocaleString() }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <span class="text-xs text-slate-400">Total Interest</span>
              <p class="text-lg font-bold text-rose-400 mt-0.5">
                ₹ {{ emiData.totalInterest.toLocaleString() }}
              </p>
            </div>
            <div>
              <span class="text-xs text-slate-400">Total Payment</span>
              <p class="text-lg font-bold text-white mt-0.5">
                ₹ {{ emiData.totalPayment.toLocaleString() }}
              </p>
            </div>
          </div>

          <!-- Ratio Visualizer -->
          <div class="space-y-2 pt-2">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-emerald-400">Principal ({{ emiData.principalPercent }}%)</span>
              <span class="text-rose-400">Interest ({{ emiData.interestPercent }}%)</span>
            </div>
            <div class="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden">
              <div class="bg-emerald-500 h-full" :style="{ width: `${emiData.principalPercent}%` }"></div>
              <div class="bg-rose-500 h-full" :style="{ width: `${emiData.interestPercent}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Amortization Schedule Table -->
    <div class="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 class="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
          Amortization Breakdown (First 12 Months)
        </h3>
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-slate-50 text-xs font-semibold"
          @click="exportCsv"
        >
          Export CSV Schedule
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
            <tr>
              <th class="p-3">Month</th>
              <th class="p-3">Principal (₹)</th>
              <th class="p-3">Interest (₹)</th>
              <th class="p-3">Remaining Balance (₹)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            <tr v-for="item in emiData.schedule.slice(0, 12)" :key="item.month" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td class="p-3 font-sans font-semibold">{{ item.month }}</td>
              <td class="p-3 text-emerald-600 dark:text-emerald-400">{{ item.principalPaid.toLocaleString() }}</td>
              <td class="p-3 text-rose-600 dark:text-rose-400">{{ item.interestPaid.toLocaleString() }}</td>
              <td class="p-3">{{ item.balance.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
