<script setup lang="ts">
import type { NuxtError } from '#app'
import { clearError } from '#app'
import NotFoundView from '~/components/common/NotFoundView.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error?.statusCode === 404)

function handleClearError() {
  clearError({ redirect: '/' })
}

useSeoMeta({
  title: is404.value ? '404 - Page Not Found | ToolBox' : 'Application Error | ToolBox',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
    <AppHeader />

    <main class="flex-1 flex flex-col items-center justify-center">
      <!-- Custom 404 Experience -->
      <NotFoundView
        v-if="is404"
        :error-path="error?.url || ''"
        :is-nuxt-error="true"
        @resolve="handleClearError"
      />

      <!-- Fallback 500 / Server Error Screen -->
      <div v-else class="max-w-md w-full px-4 py-16 text-center space-y-6">
        <div class="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center mx-auto shadow-md">
          <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <div>
          <div class="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">
            Error {{ error?.statusCode || 500 }}
          </div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {{ error?.message || 'An unexpected error occurred while loading this page.' }}
          </p>
        </div>

        <div class="pt-2">
          <button
            type="button"
            class="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            @click="handleClearError"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
