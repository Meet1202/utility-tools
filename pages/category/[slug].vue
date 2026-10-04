<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useToolRegistry } from '~/composables/useToolRegistry'
import { CATEGORIES } from '~/data/tools'
import ToolCard from '~/components/tools/ToolCard.vue'
import ToolIcon from '~/components/tools/ToolIcon.vue'

const route = useRoute()
const { getCategoryTools } = useToolRegistry()

const categorySlug = computed(() => route.params.slug as string)
const category = computed(() => CATEGORIES.find(c => c.slug === categorySlug.value))
const tools = computed(() => getCategoryTools(categorySlug.value))

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string) || 'https://everyday-use-tools.vercel.app'
const canonicalUrl = computed(() => `${siteUrl}/category/${categorySlug.value}`)

if (!category.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Category Not Found'
  })
}

useSeoMeta({
  title: computed(() => `${category.value?.name || 'Category'} Tools - Free In-Browser Utilities | ToolBox`),
  description: computed(() => `Explore free, private in-browser ${category.value?.name.toLowerCase()} tools. ${category.value?.description} Zero data uploads.`),
  ogTitle: computed(() => `${category.value?.name || 'Category'} Tools - Free Online Utilities | ToolBox`),
  ogDescription: computed(() => `Explore fast and private ${category.value?.name.toLowerCase()} tools. All operations run directly in your browser.`),
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogImage: `${siteUrl}/og-image.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: computed(() => `${category.value?.name || 'Category'} Tools | ToolBox`),
  twitterDescription: computed(() => category.value?.description || 'Browse online tools.'),
  twitterImage: `${siteUrl}/og-image.jpg`
})

const categoryJsonLd = computed(() => [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.value?.name} Utilities`,
    description: category.value?.description,
    url: canonicalUrl.value,
    isPartOf: {
      '@type': 'WebSite',
      name: 'ToolBox',
      url: siteUrl
    }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl
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
        name: category.value?.name,
        item: canonicalUrl.value
      }
    ]
  }
])

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(categoryJsonLd.value))
    }
  ]
})
</script>

<template>
  <div v-if="category" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
    <!-- Breadcrumb -->
    <nav class="flex items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
      <ol class="flex items-center gap-1.5">
        <li>
          <NuxtLink to="/" class="hover:text-brand-600 dark:hover:text-brand-400">Home</NuxtLink>
        </li>
        <li class="text-slate-400">/</li>
        <li>
          <NuxtLink to="/tools" class="hover:text-brand-600 dark:hover:text-brand-400">Tools</NuxtLink>
        </li>
        <li class="text-slate-400">/</li>
        <li class="font-medium text-slate-800 dark:text-slate-200 capitalize">
          {{ category.name }}
        </li>
      </ol>
    </nav>

    <!-- Category Header Banner -->
    <div class="p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 mb-10">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
          <ToolIcon :name="category.icon" :size="30" />
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {{ category.name }}
          </h1>
          <p class="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
            {{ category.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Tools Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <ToolCard
        v-for="tool in tools"
        :key="tool.slug"
        :tool="tool"
      />
    </div>
  </div>
</template>
