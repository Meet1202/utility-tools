<script setup lang="ts">
import { ref } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

const { client, isConfigured } = useSupabase()

const name = ref('')
const email = ref('')
const subject = ref('Tool Suggestion')
const message = ref('')

const isSubmitting = ref(false)
const submitted = ref(false)
const errorMessage = ref<string | null>(null)

const subjectOptions = [
  'Tool Suggestion',
  'Bug Report',
  'Feature Feedback',
  'Partnership / Inquiry',
  'Other'
]

async function onSubmit() {
  errorMessage.value = null
  isSubmitting.value = true

  try {
    if (!isConfigured || !client) {
      // Demo / offline fallback if Supabase credentials are not yet added to .env
      console.warn('Supabase is not configured yet. Set SUPABASE_URL and SUPABASE_KEY in your .env file.')
      await new Promise(resolve => setTimeout(resolve, 800))
      submitted.value = true
      return
    }

    const { error } = await client.from('contact_submissions').insert([
      {
        name: name.value.trim(),
        email: email.value.trim(),
        subject: subject.value,
        message: message.value.trim(),
        created_at: new Date().toISOString()
      }
    ])

    if (error) {
      throw new Error(error.message || 'Failed to submit form to Supabase')
    }

    submitted.value = true
  } catch (err: any) {
    console.error('Contact submission error:', err)
    errorMessage.value = err.message || 'Something went wrong while submitting. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  submitted.value = false
  errorMessage.value = null
  name.value = ''
  email.value = ''
  subject.value = 'Tool Suggestion'
  message.value = ''
}

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string) || 'https://everyday-use-tools.vercel.app'
const canonicalUrl = `${siteUrl}/contact`

useSeoMeta({
  title: 'Contact Us & Suggest Tools | ToolBox',
  description: 'Reach out to the ToolBox team for new tool suggestions, feature requests, bug reports, or general feedback.',
  ogTitle: 'Contact Us & Suggest Tools | ToolBox',
  ogDescription: 'Have a tool idea? Submit your feedback directly to the ToolBox team.',
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogImage: `${siteUrl}/og-image.jpg`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Contact Us & Suggest Tools | ToolBox',
  twitterDescription: 'Reach out for tool suggestions, bug reports, and feedback.',
  twitterImage: `${siteUrl}/og-image.jpg`
})

const contactJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact ToolBox',
  description: 'Contact us for tool requests, feedback, or bug reports.',
  url: canonicalUrl,
  mainEntity: {
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
      children: computed(() => JSON.stringify(contactJsonLd.value))
    }
  ]
})
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
    <!-- Header -->
    <div class="text-center mb-8 sm:mb-10">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-3">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>We're Listening</span>
      </div>

      <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Contact & Tool Suggestions
      </h1>
      <p class="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
        Have an idea for a new client-side tool or an improvement? Send us your suggestions and we will build it.
      </p>

      <!-- Supabase Setup Notice if not configured -->
      <div
        v-if="!isConfigured"
        class="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 text-left flex items-start gap-2.5 max-w-lg mx-auto"
      >
        <svg class="w-4 h-4 shrink-0 text-amber-600 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <span class="font-bold">Supabase Configuration:</span>
          Add your <code class="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded text-[11px] font-mono">SUPABASE_URL</code> and <code class="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded text-[11px] font-mono">SUPABASE_KEY</code> in <code class="font-mono text-[11px]">.env</code> to persist messages directly to your Supabase database.
        </div>
      </div>
    </div>

    <!-- Form Container -->
    <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
      <!-- Success State -->
      <div v-if="submitted" class="py-8 text-center space-y-4 animate-in fade-in duration-300">
        <div class="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">Message Sent Successfully!</h3>
          <p class="mt-1.5 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Thank you for reaching out, <span class="font-semibold text-slate-800 dark:text-slate-200">{{ name }}</span>. Your feedback has been safely submitted and our team will review it.
          </p>
        </div>

        <div class="pt-2">
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-sm transition-colors cursor-pointer"
            @click="resetForm"
          >
            Send Another Note
          </button>
        </div>
      </div>

      <!-- Active Form -->
      <form v-else class="space-y-4 sm:space-y-5" @submit.prevent="onSubmit">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start justify-between gap-2"
        >
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-rose-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
          <button
            type="button"
            class="text-rose-600 hover:text-rose-800 dark:hover:text-rose-200 font-bold"
            @click="errorMessage = null"
          >
            ✕
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Name -->
          <div>
            <label for="contact-name" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Your Name <span class="text-rose-500">*</span>
            </label>
            <input
              id="contact-name"
              v-model="name"
              required
              type="text"
              :disabled="isSubmitting"
              placeholder="Jane Doe"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 transition-colors"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="contact-email" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address <span class="text-rose-500">*</span>
            </label>
            <input
              id="contact-email"
              v-model="email"
              required
              type="email"
              :disabled="isSubmitting"
              placeholder="jane@example.com"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 transition-colors"
            />
          </div>
        </div>

        <!-- Topic / Category -->
        <div>
          <label for="contact-subject" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Topic
          </label>
          <select
            id="contact-subject"
            v-model="subject"
            :disabled="isSubmitting"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <option v-for="opt in subjectOptions" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </div>

        <!-- Message -->
        <div>
          <label for="contact-message" class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Your Message / Suggestion <span class="text-rose-500">*</span>
          </label>
          <textarea
            id="contact-message"
            v-model="message"
            required
            rows="5"
            :disabled="isSubmitting"
            placeholder="Tell us about the tool you'd like to see, or any issues you encountered..."
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 transition-colors resize-y"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg
            v-if="isSubmitting"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isSubmitting ? 'Sending Message...' : 'Submit' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
