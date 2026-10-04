<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { generatePassword, evaluatePasswordStrength } from '~/utils/crypto'
import CopyButton from '~/components/tools/CopyButton.vue'
import { useDownload } from '~/composables/useDownload'

const { downloadText } = useDownload()

const length = ref(18)
const uppercase = ref(true)
const lowercase = ref(true)
const numbers = ref(true)
const symbols = ref(true)
const excludeAmbiguous = ref(false)

const currentPassword = ref('')
const bulkCount = ref(5)
const bulkList = ref<string[]>([])
const showBulk = ref(false)

const strength = computed(() => evaluatePasswordStrength(currentPassword.value))

function generate() {
  currentPassword.value = generatePassword({
    length: length.value,
    uppercase: uppercase.value,
    lowercase: lowercase.value,
    numbers: numbers.value,
    symbols: symbols.value,
    excludeAmbiguous: excludeAmbiguous.value
  })

  if (showBulk.value) {
    bulkList.value = Array.from({ length: bulkCount.value }, () =>
      generatePassword({
        length: length.value,
        uppercase: uppercase.value,
        lowercase: lowercase.value,
        numbers: numbers.value,
        symbols: symbols.value,
        excludeAmbiguous: excludeAmbiguous.value
      })
    )
  }
}

function downloadBulk() {
  if (bulkList.value.length > 0) {
    downloadText(bulkList.value.join('\n'), 'passwords.txt')
  }
}

onMounted(() => {
  generate()
})
</script>

<template>
  <div class="space-y-6 max-w-3xl mx-auto">
    <!-- Big Password Display Card -->
    <div class="p-6 sm:p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4 text-center">
      <div class="flex items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900 text-white font-mono text-base sm:text-xl font-bold break-all shadow-inner relative group">
        <span class="text-brand-400 select-all tracking-wider">{{ currentPassword }}</span>
        <div class="flex items-center gap-2 shrink-0">
          <CopyButton :text="currentPassword" size="md" variant="primary" />
          <button
            type="button"
            title="Generate new password"
            aria-label="Generate new password"
            class="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors active:rotate-180 duration-300"
            @click="generate"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 16h5v5"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Strength Meter Bar -->
      <div class="space-y-1.5 text-left">
        <div class="flex items-center justify-between text-xs font-semibold">
          <span class="text-slate-500">Security Strength</span>
          <span :class="strength.label === 'Unbreakable' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'">
            {{ strength.label }} ({{ strength.score }}/100)
          </span>
        </div>
        <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="strength.color"
            :style="{ width: `${strength.score}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Configuration Options -->
    <div class="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-6">
      <!-- Length Slider -->
      <div>
        <div class="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white mb-2">
          <span>Password Length</span>
          <span class="px-2.5 py-0.5 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 font-mono text-base">
            {{ length }} characters
          </span>
        </div>
        <input
          v-model.number="length"
          type="range"
          min="8"
          max="64"
          class="w-full accent-brand-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          @input="generate"
        />
        <div class="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>8 (Minimum)</span>
          <span>16 (Recommended)</span>
          <span>32+ (High Security)</span>
          <span>64 (Extreme)</span>
        </div>
      </div>

      <!-- Character Sets Checkboxes -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900 cursor-pointer">
          <input v-model="uppercase" type="checkbox" class="w-4 h-4 rounded text-brand-600" @change="generate" />
          <div>
            <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Uppercase Letters</div>
            <div class="text-[11px] text-slate-400 font-mono">A-Z</div>
          </div>
        </label>

        <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900 cursor-pointer">
          <input v-model="lowercase" type="checkbox" class="w-4 h-4 rounded text-brand-600" @change="generate" />
          <div>
            <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Lowercase Letters</div>
            <div class="text-[11px] text-slate-400 font-mono">a-z</div>
          </div>
        </label>

        <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900 cursor-pointer">
          <input v-model="numbers" type="checkbox" class="w-4 h-4 rounded text-brand-600" @change="generate" />
          <div>
            <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Numbers</div>
            <div class="text-[11px] text-slate-400 font-mono">0-9</div>
          </div>
        </label>

        <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900 cursor-pointer">
          <input v-model="symbols" type="checkbox" class="w-4 h-4 rounded text-brand-600" @change="generate" />
          <div>
            <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Special Symbols</div>
            <div class="text-[11px] text-slate-400 font-mono">!@#$%^&*</div>
          </div>
        </label>
      </div>

      <!-- Exclude Ambiguous Characters -->
      <label class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
        <input v-model="excludeAmbiguous" type="checkbox" class="rounded text-brand-600" @change="generate" />
        <span>Exclude Ambiguous Characters (avoids confusing 0, O, 1, l, I)</span>
      </label>

      <!-- Bulk Generation Toggle -->
      <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button
          type="button"
          class="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          @click="showBulk = !showBulk; if (showBulk) generate()"
        >
          {{ showBulk ? 'Hide Bulk Generator' : 'Generate Multiple Passwords in Bulk' }}
        </button>
      </div>

      <!-- Bulk passwords view -->
      <div v-if="showBulk" class="space-y-3 pt-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase">Bulk List ({{ bulkList.length }})</span>
          <button
            type="button"
            class="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            @click="downloadBulk"
          >
            Download .txt
          </button>
        </div>

        <div class="space-y-1.5 font-mono text-xs">
          <div
            v-for="(p, i) in bulkList"
            :key="i"
            class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800"
          >
            <span class="truncate">{{ p }}</span>
            <CopyButton :text="p" variant="icon" size="sm" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
