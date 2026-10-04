<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { ToolItem } from '~/data/tools'
import ToolIcon from './ToolIcon.vue'
import FaqList from './FaqList.vue'
import RelatedTools from './RelatedTools.vue'
import { useRecentTools } from '~/composables/useRecentTools'
import { useToolRegistry } from '~/composables/useToolRegistry'
import { useFavorites } from '~/composables/useFavorites'

const props = defineProps<{
  tool: ToolItem
}>()

const { getRelatedTools } = useToolRegistry()
const { addRecent } = useRecentTools()
const { isFavorite, toggleFavorite } = useFavorites()

const favorited = computed(() => isFavorite(props.tool.slug))
const related = computed(() => getRelatedTools(props.tool.slug, 3))

onMounted(() => {
  addRecent(props.tool.slug)
})

// Canonical URL
const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string) || 'https://everyday-use-tools.vercel.app'
const canonicalUrl = `${siteUrl}${route.path}`

// SEO Meta
useSeoMeta({
  title: `${props.tool.seoTitle} | ToolBox`,
  description: props.tool.seoDescription,
  ogTitle: `${props.tool.seoTitle} | ToolBox`,
  ogDescription: props.tool.seoDescription,
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogImage: `${siteUrl}/og-image.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: `${props.tool.seoTitle} | ToolBox`,
  twitterDescription: props.tool.seoDescription,
  twitterImage: `${siteUrl}/og-image.jpg`
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }]
})

// JSON-LD Schemas: WebApplication, FAQPage, BreadcrumbList
const jsonLdSchemas = computed(() => {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: props.tool.name,
    description: props.tool.seoDescription,
    url: canonicalUrl,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteUrl}/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${siteUrl}/tools`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: props.tool.name,
        item: canonicalUrl
      }
    ]
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: props.tool.faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }

  return [webAppSchema, breadcrumbSchema, faqSchema]
})

useHead({
  script: jsonLdSchemas.value.map(schema => ({
    type: 'application/ld+json',
    innerHTML: JSON.stringify(schema)
  }))
})
</script>

<template>
  <div class="py-6 sm:py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Breadcrumb navigation -->
    <nav class="flex items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
      <ol class="flex items-center gap-1.5 flex-wrap">
        <li>
          <NuxtLink to="/" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Home
          </NuxtLink>
        </li>
        <li class="text-slate-400 dark:text-slate-600">/</li>
        <li>
          <NuxtLink :to="`/category/${tool.category}`" class="capitalize hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {{ tool.category }}
          </NuxtLink>
        </li>
        <li class="text-slate-400 dark:text-slate-600">/</li>
        <li class="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-none" aria-current="page">
          {{ tool.name }}
        </li>
      </ol>
    </nav>

    <!-- Header Section -->
    <header class="mb-6 sm:mb-8">
      <div class="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 shadow-xs shrink-0">
            <ToolIcon :name="tool.icon" :size="22" />
          </div>

          <div class="min-w-0">
            <!-- Exactly one H1 per page -->
            <h1 class="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {{ tool.name }}
            </h1>
          </div>
        </div>

        <!-- Favorite Toggle Action Button -->
        <button
          type="button"
          :aria-label="favorited ? 'Remove from favorites' : 'Add to favorites'"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer select-none"
          :class="[
            favorited
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 shadow-xs hover:bg-rose-100'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-900'
          ]"
          @click="toggleFavorite(tool.slug)"
        >
          <svg
            viewBox="0 0 24 24"
            class="w-4 h-4 transition-transform active:scale-125"
            :class="favorited ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current stroke-2'"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          <span>{{ favorited ? 'Favorited' : 'Bookmark Tool' }}</span>
        </button>
      </div>

      <!-- One-line description -->
      <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
        {{ tool.shortDescription }}
      </p>

      <!-- Privacy badge and guarantee -->
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          <svg class="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
          <span>Runs in your browser. Files never leave your device.</span>
        </div>

        <span class="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>

        <span class="text-xs text-slate-500 dark:text-slate-400">
          No cloud storage • Zero tracking • Instant processing
        </span>
      </div>
    </header>

    <!-- Tool Interactive UI Slot with ClientOnly Skeleton Fallback -->
    <main class="mb-14">
      <ClientOnly>
        <slot />
        <template #fallback>
          <div class="p-8 rounded-2xl glass-panel animate-pulse space-y-4">
            <div class="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
            <div class="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            <div class="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
          </div>
        </template>
      </ClientOnly>
    </main>

    <!-- How-To Guide Section -->
    <section class="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800">
      <div class="mb-6">
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span class="w-2 h-6 bg-brand-500 rounded-full inline-block"></span>
          How to Use {{ tool.name }}
        </h2>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Simple step-by-step instructions to get started in seconds.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(step, index) in tool.howToSteps"
          :key="index"
          class="flex items-start gap-3.5 p-4 rounded-xl glass-card"
        >
          <div class="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {{ index + 1 }}
          </div>
          <p class="text-sm text-slate-700 dark:text-slate-300 pt-0.5 leading-relaxed">
            {{ step }}
          </p>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <FaqList :faq="tool.faq" />

    <!-- Related Tools Section -->
    <RelatedTools :tools="related" />
  </div>
</template>
