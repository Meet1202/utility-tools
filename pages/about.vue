<script setup lang="ts">
import { computed } from 'vue'

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string) || 'https://everyday-use-tools.vercel.app'
const canonicalUrl = `${siteUrl}/about`

useSeoMeta({
  title: 'About ToolBox - Privacy-First Web Utilities',
  description: 'Learn about ToolBox: an open suite of browser-native utilities designed for speed, privacy, and simplicity without ads, trackers, or server uploads.',
  ogTitle: 'About ToolBox - Privacy-First Web Utilities',
  ogDescription: 'Why we built ToolBox: 100% client-side privacy, instant performance, and open-source utility tools for creators and developers.',
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogImage: `${siteUrl}/og-image.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'About ToolBox - Privacy-First Web Utilities',
  twitterDescription: 'Discover ToolBox - fast, secure, browser-native online utilities.',
  twitterImage: `${siteUrl}/og-image.jpg`
})

const aboutJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About ToolBox',
  description: 'Learn about ToolBox, an open suite of browser-native utilities designed for speed, privacy, and simplicity without ads or tracking.',
  url: canonicalUrl,
  mainEntity: {
    '@type': 'Organization',
    name: 'ToolBox',
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`
  }
}))

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(aboutJsonLd.value))
    }
  ]
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
    <div class="max-w-2xl mb-12">
      <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        About ToolBox
      </h1>
      <p class="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
        We built ToolBox to solve a simple frustration: online utilities shouldn't force you to upload sensitive documents to unverified servers or wade through spammy advertisements.
      </p>
    </div>

    <div class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-white text-base">Instant Performance</h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Because processing runs in your computer's local memory, operations finish instantly without network upload delays.
          </p>
        </div>

        <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-white text-base">Absolute Privacy</h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Zero cloud uploads. Whether you are merging contracts, generating QR codes, or compressing photos, data stays on your machine.
          </p>
        </div>

        <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-white text-base">Clean & Ad-Free</h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            A minimalist, focused design engineered for productive daily use by developers, designers, and students.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
