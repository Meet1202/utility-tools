<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
    <NuxtRouteAnnouncer />
    <AppHeader />
    <div class="flex-1">
      <NuxtPage />
    </div>
    <AppFooter />
  </div>
</template>
