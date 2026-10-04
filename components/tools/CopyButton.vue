<script setup lang="ts">
import { useClipboard } from '~/composables/useClipboard'

const props = withDefaults(
  defineProps<{
    text: string
    label?: string
    copiedLabel?: string
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon'
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    label: 'Copy',
    copiedLabel: 'Copied!',
    variant: 'secondary',
    size: 'md'
  }
)

const { copy, copied } = useClipboard()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
    case 'ghost':
      return 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
    case 'icon':
      return 'p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg'
    default:
      return 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 shadow-xs'
  }
})

const sizeClasses = computed(() => {
  if (props.variant === 'icon') return ''
  switch (props.size) {
    case 'sm':
      return 'px-2.5 py-1 text-xs rounded-lg'
    case 'lg':
      return 'px-4 py-2.5 text-base rounded-xl'
    default:
      return 'px-3 py-1.5 text-sm rounded-lg'
  }
})
</script>

<template>
  <button
    type="button"
    :aria-label="copied ? copiedLabel : label"
    :class="[
      'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
      variantClasses,
      sizeClasses,
      copied ? '!border-emerald-500 !text-emerald-600 dark:!text-emerald-400' : ''
    ]"
    @click="copy(text)"
  >
    <svg
      v-if="!copied"
      class="w-4 h-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>

    <svg
      v-else
      class="w-4 h-4 shrink-0 text-emerald-500 animate-in zoom-in-75 duration-200"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="20 6 9 17 4 12"/>
    </svg>

    <span v-if="variant !== 'icon'">
      {{ copied ? copiedLabel : label }}
    </span>
  </button>
</template>
