<script setup lang="ts">
const colorMode = useColorMode()

function cycleTheme() {
  if (colorMode.preference === 'system') {
    colorMode.preference = 'light'
  } else if (colorMode.preference === 'light') {
    colorMode.preference = 'dark'
  } else {
    colorMode.preference = 'system'
  }
}

const currentLabel = computed(() => {
  if (colorMode.preference === 'system') return 'System'
  return colorMode.value === 'dark' ? 'Dark' : 'Light'
})
</script>

<template>
  <button
    type="button"
    :title="`Current theme: ${currentLabel}. Click to switch.`"
    :aria-label="`Switch theme, currently ${currentLabel}`"
    class="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    @click="cycleTheme"
  >
    <!-- Light Mode Sun Icon -->
    <svg
      v-if="colorMode.value === 'light'"
      class="w-5 h-5 text-amber-500 transition-transform duration-200 rotate-0 scale-100"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2"/>
      <path d="M12 20v2"/>
      <path d="m4.93 4.93 1.41 1.41"/>
      <path d="m17.66 17.66 1.41 1.41"/>
      <path d="M2 12h2"/>
      <path d="M20 12h2"/>
      <path d="m6.34 17.66-1.41 1.41"/>
      <path d="m19.07 4.93-1.41 1.41"/>
    </svg>

    <!-- Dark Mode Moon Icon -->
    <svg
      v-else
      class="w-5 h-5 text-indigo-400 transition-transform duration-200 rotate-0 scale-100"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  </button>
</template>
