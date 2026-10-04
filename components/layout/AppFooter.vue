<script setup lang="ts">
import { useToolRegistry } from '~/composables/useToolRegistry'

const { categories, tools } = useToolRegistry()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="mt-20 border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
        <!-- Col 1: Brand & Privacy Promise -->
        <div class="md:col-span-1 space-y-4">
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-slate-900 dark:text-white">
              Tool<span class="text-brand-600 dark:text-brand-400">Box</span>
            </span>
          </NuxtLink>

          <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Free, fast, privacy-first utility tools. All operations run 100% locally in your web browser. No uploads, no servers, zero telemetry.
          </p>

          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>100% Client-Side Architecture</span>
          </div>
        </div>

        <!-- Col 2: Categories -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Tool Categories
          </h3>
          <ul class="space-y-2.5 text-sm">
            <li v-for="cat in categories" :key="cat.slug">
              <NuxtLink
                :to="`/category/${cat.slug}`"
                class="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {{ cat.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 3: Popular Tools -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            Popular Utilities
          </h3>
          <ul class="space-y-2.5 text-sm">
            <li>
              <NuxtLink to="/tools/qr-generator" class="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                QR Code Generator
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tools/merge-pdf" class="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Merge PDF Online
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tools/image-compressor" class="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Image Compressor
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tools/json-formatter" class="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                JSON Formatter
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tools/password-generator" class="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Password Generator
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tools/emi-calculator" class="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                EMI Calculator
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 4: Trust & Navigation -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            About & Transparency
          </h3>
          <ul class="space-y-2.5 text-sm">
            <li>
              <NuxtLink to="/about" class="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                About ToolBox
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/privacy" class="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Privacy Policy & Disclosures
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Contact & Feedback
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <p>© {{ currentYear }} ToolBox</p>
        <p>All processing occurs locally on your device • Zero tracking scripts</p>
      </div>
    </div>
  </footer>
</template>
