<script setup lang="ts">
import { ref, computed } from 'vue'
import { decodeJwt, type JwtDecoded } from '~/utils/dev'
import CopyButton from '~/components/tools/CopyButton.vue'

// Sample standard JWT
const inputToken = ref('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxODMxMzkwOTIyfQ.4xH0d8QvM3b-U9v5K2e0oG6lR1tY8uW-pA3z7C5xN1k')
const decodeError = ref<string | null>(null)

const decoded = computed<JwtDecoded | null>(() => {
  decodeError.value = null
  if (!inputToken.value.trim()) return null
  try {
    return decodeJwt(inputToken.value)
  } catch (err: any) {
    decodeError.value = err.message || 'Invalid JWT structure'
    return null
  }
})

// Visual 3-part split
const tokenParts = computed(() => {
  const parts = inputToken.value.trim().split('.')
  return {
    header: parts[0] || '',
    payload: parts[1] || '',
    signature: parts[2] || ''
  }
})

function loadSample() {
  inputToken.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxODMxMzkwOTIyfQ.4xH0d8QvM3b-U9v5K2e0oG6lR1tY8uW-pA3z7C5xN1k'
}

function clearAll() {
  inputToken.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- Security Banner -->
    <div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-start gap-3">
      <svg class="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
      <div>
        <p class="font-bold">Client-Side Privacy Guarantee</p>
        <p class="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
          JSON Web Tokens are decoded entirely inside your web browser. No token data is ever transmitted across the network. Cryptographic signatures are not verified without your private key.
        </p>
      </div>
    </div>

    <!-- Token Input Section -->
    <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-3">
      <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <label class="font-bold uppercase tracking-wider">Paste JWT Token</label>
        <div class="flex gap-2">
          <button type="button" class="hover:text-brand-600 font-semibold" @click="loadSample">Load Sample</button>
          <button type="button" class="hover:text-rose-600 font-semibold" @click="clearAll">Clear</button>
        </div>
      </div>

      <textarea
        v-model="inputToken"
        rows="4"
        placeholder="Paste eyJhbGciOi..."
        class="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs break-all focus:outline-none focus:ring-2 focus:ring-brand-500"
      ></textarea>

      <!-- Colored Token String Preview -->
      <div v-if="tokenParts.header && tokenParts.payload" class="p-3 rounded-xl bg-slate-900 font-mono text-xs break-all leading-relaxed">
        <span class="text-rose-400">{{ tokenParts.header }}</span>
        <span class="text-slate-400">.</span>
        <span class="text-purple-400">{{ tokenParts.payload }}</span>
        <span class="text-slate-400">.</span>
        <span class="text-cyan-400">{{ tokenParts.signature }}</span>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="decodeError"
      class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-mono"
    >
      {{ decodeError }}
    </div>

    <!-- Decoded Output Details -->
    <div v-if="decoded" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <!-- HEADER -->
      <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 class="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            Header: Algorithm & Token Type
          </h3>
          <CopyButton :text="JSON.stringify(decoded.header, null, 2)" size="sm" variant="ghost" />
        </div>

        <pre class="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto"><code>{{ JSON.stringify(decoded.header, null, 2) }}</code></pre>
      </div>

      <!-- PAYLOAD -->
      <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 class="font-bold text-sm text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
            Payload: Data & Claims
          </h3>
          <CopyButton :text="JSON.stringify(decoded.payload, null, 2)" size="sm" variant="ghost" />
        </div>

        <!-- Expiry status badge -->
        <div v-if="decoded.expFormatted" class="p-3 rounded-xl flex items-center justify-between text-xs" :class="decoded.isExpired ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'">
          <span class="font-semibold">Expiration Status:</span>
          <span>{{ decoded.expFormatted }}</span>
        </div>

        <pre class="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-80"><code>{{ JSON.stringify(decoded.payload, null, 2) }}</code></pre>
      </div>
    </div>
  </div>
</template>
