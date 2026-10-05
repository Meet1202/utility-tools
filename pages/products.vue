<script setup lang="ts">
import { computed } from 'vue'

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string) || 'https://everyday-use-tools.vercel.app'
const canonicalUrl = `${siteUrl}/products`

useSeoMeta({
  title: 'Our Products & Ecosystem - One Tap Bill & Sanyam Group NGO',
  description: 'Explore our ecosystem of applications and social initiatives: One Tap Bill (effortless billing software) and Sanyam Group (charity nonprofit NGO in Ahmedabad).',
  ogTitle: 'Our Products & Ecosystem - One Tap Bill & Sanyam Group NGO',
  ogDescription: 'Discover our software solutions and community welfare initiatives. Effortless business billing and nonprofit charity.',
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogImage: `${siteUrl}/og-image.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Our Products & Ecosystem - One Tap Bill & Sanyam Group NGO',
  twitterDescription: 'Discover One Tap Bill and Sanyam Group charity NGO.',
  twitterImage: `${siteUrl}/og-image.jpg`
})

const productsJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Our Products & Ecosystem',
  description: 'Showcasing One Tap Bill billing software and Sanyam Group nonprofit NGO in Ahmedabad.',
  url: canonicalUrl,
  publisher: {
    '@type': 'Organization',
    name: 'ToolBox',
    url: siteUrl
  }
}))

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [
    {
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(productsJsonLd.value))
    }
  ]
})
</script>

<template>
  <div class="min-h-screen py-12 sm:py-20 relative overflow-hidden">
    <!-- Background Ambient Glows -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/15 dark:bg-brand-500/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
    <div class="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
    <div class="absolute -bottom-20 left-1/3 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <!-- Hero Header -->
      <div class="text-center max-w-3xl mx-auto space-y-5">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60 shadow-xs">
          <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span>Ecosystem & Social Impact</span>
        </div>

        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
          Crafted with Passion, Built for
          <span class="bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent"> Real Impact</span>
        </h1>

        <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Beyond our free developer utilities at ToolBox, explore our dedicated software tools built for everyday business efficiency and our philanthropic nonprofit initiatives empowering communities.
        </p>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        <!-- PRODUCT 1: One Tap Bill -->
        <article class="relative group rounded-3xl p-6 sm:p-8 lg:p-10 glass-card border border-slate-200/80 dark:border-slate-800/90 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-white/90 via-sky-50/30 to-indigo-50/20 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-950">
          <!-- Ambient Card Accent -->
          <div class="absolute -top-24 -right-24 w-56 h-56 bg-sky-500/10 dark:bg-sky-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>

          <div class="space-y-6 relative z-10">
            <!-- Header Badges & Icon -->
            <div class="flex items-start justify-between gap-4">
              <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform duration-300">
                <!-- Receipt / Invoice Icon -->
                <svg class="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                  <path d="M12 6v12"/>
                </svg>
              </div>

              <div class="flex flex-wrap gap-2 justify-end">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300/40 dark:border-sky-800/40">
                  Billing SaaS
                </span>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
                  Live & Active
                </span>
              </div>
            </div>

            <!-- Title & Tagline -->
            <div class="space-y-2">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                One Tap Bill
              </h2>
              <p class="text-sm sm:text-base font-semibold text-sky-600 dark:text-sky-400">
                Billing made effortless
              </p>
              <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                The fastest, most intuitive billing software designed to generate professional bills and receipts in a single tap. Ideal for retail stores, freelance consultants, service providers, and growing businesses.
              </p>
            </div>

            <!-- Key Features Checklist -->
            <div class="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
              <div class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Core Capabilities
              </div>
              <ul class="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li class="flex items-center gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span><strong>Instant 1-Tap Bill Generation:</strong> Create professional bills and receipts with minimal clicks in seconds.</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span><strong>Instant Print & Digital Sharing:</strong> Print clean POS thermal receipts, A4 bills, or share digitally with customers.</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span><strong>Customer Ledger & Dues:</strong> Maintain clear customer records, track balance payments, and transaction history.</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span><strong>Fast & Multi-Device:</strong> Lightweight, responsive web app that works smoothly across phones, tablets, and desktop.</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Action Button -->
          <div class="pt-8 mt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-4">
            <span class="text-xs font-mono text-slate-400 dark:text-slate-500">
              onetapbill.netlify.app
            </span>

            <a
              href="https://onetapbill.netlify.app/login"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-md shadow-sky-600/20 hover:shadow-lg hover:shadow-sky-600/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Open One Tap Bill</span>
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </article>

        <!-- PRODUCT 2: Sanyam Group Charity NGO -->
        <article class="relative group rounded-3xl p-6 sm:p-8 lg:p-10 glass-card border border-slate-200/80 dark:border-slate-800/90 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-white/90 via-rose-50/30 to-amber-50/20 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-950">
          <!-- Ambient Card Accent -->
          <div class="absolute -top-24 -right-24 w-56 h-56 bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>

          <div class="space-y-6 relative z-10">
            <!-- Header Badges & Icon -->
            <div class="flex items-start justify-between gap-4">
              <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-red-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform duration-300">
                <!-- Heart / Charity Icon -->
                <svg class="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 2.99.07L12 11l-.03.03c.86.78 2.17.75 2.99-.07v0a2.17 2.17 0 0 0 0-3.08L12 5Z"/>
                </svg>
              </div>

              <div class="flex flex-wrap gap-2 justify-end">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300/40 dark:border-rose-800/40">
                  Nonprofit NGO
                </span>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
                  Ahmedabad, India
                </span>
              </div>
            </div>

            <!-- Title & Tagline -->
            <div class="space-y-2">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Sanyam Group
              </h2>
              <p class="text-sm sm:text-base font-semibold text-rose-600 dark:text-rose-400">
                Help Others & Be Happy
              </p>
              <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                A passionate registered nonprofit organization dedicated to social upliftment, humanitarian assistance, child education, and nutritious food drives for underprivileged communities across Ahmedabad.
              </p>
            </div>

            <!-- Key Features Checklist -->
            <div class="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
              <div class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Mission & Impact Areas
              </div>
              <ul class="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li class="flex items-center gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span><strong>Food & Ration Drives:</strong> Serving nutritious cooked meals and distributing monthly ration kits to needy families.</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span><strong>Underprivileged Child Education:</strong> Sponsoring school fees, textbooks, bags, and stationery for bright minds.</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span><strong>Medical & Emergency Aid:</strong> Organizing free medical checkups and extending help for critical treatments.</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span><strong>Transparent & Compassionate:</strong> 100% volunteer-led group ensuring every contribution goes directly to those in need.</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Action Button -->
          <div class="pt-8 mt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-4">
            <span class="text-xs font-mono text-slate-400 dark:text-slate-500">
              sanyam-group.vercel.app
            </span>

            <a
              href="https://sanyam-group.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-md shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-600/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Visit Sanyam Group</span>
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </article>
      </div>

      <!-- Partnership & Support Banner -->
      <div class="p-8 sm:p-10 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 text-center space-y-4 max-w-4xl mx-auto">
        <h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Interested in Collaborations or Contributing?
        </h3>
        <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Whether you want to integrate with One Tap Bill, volunteer or donate with Sanyam Group, or build something together, we'd love to hear from you.
        </p>
        <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
          <NuxtLink
            to="/contact"
            class="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-brand-600 dark:hover:bg-brand-400 transition-colors shadow-sm"
          >
            Get in Touch
          </NuxtLink>
          <NuxtLink
            to="/tools"
            class="px-6 py-2.5 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Explore ToolBox Utilities
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
