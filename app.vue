<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string) || 'https://everyday-use-tools.vercel.app'
const route = useRoute()

// Global Structured Data: WebSite with SearchAction + Organization
const globalJsonLd = computed(() => [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ToolBox',
    url: siteUrl,
    description: 'Fast, free, privacy-first online utilities for developers, designers, and creators.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/tools?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ToolBox',
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    sameAs: [
      'https://github.com/Meet1202/utility-tools'
    ]
  }
])

useHead({
  link: [
    {
      rel: 'canonical',
      href: computed(() => `${siteUrl}${route.path === '/' ? '' : route.path}`)
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(globalJsonLd.value))
    }
  ]
})
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
