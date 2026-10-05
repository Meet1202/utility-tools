import pkg from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt'
  ],

  nitro: {
    prerender: {
      crawlLinks: true
    }
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark'
  },

  runtimeConfig: {
    public: {
      appVersion: pkg.version,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://everyday-use-tools.vercel.app',
      supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_KEY || ''
    }
  },

  app: {
    head: {
      title: 'ToolBox - Fast, Private, In-Browser Online Utilities',
      titleTemplate: '%s',
      htmlAttrs: {
        lang: 'en',
        dir: 'ltr'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        {
          name: 'description',
          content: 'Free, fast, privacy-first online utilities for developers, designers, and creators. All operations run directly in your browser—files never leave your device.'
        },
        {
          name: 'keywords',
          content: 'online tools, utility tools, pdf merge, split pdf, compress image, convert image, qr code generator, json formatter, jwt decoder, base64 encoder, emi calculator, gst calculator, password generator, private online tools, browser utilities'
        },
        { name: 'author', content: 'ToolBox Team' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'theme-color', content: '#4f46e5' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'ToolBox' },

        // OpenGraph
        { property: 'og:site_name', content: 'ToolBox' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:title', content: 'ToolBox - Fast, Private, In-Browser Online Utilities' },
        {
          property: 'og:description',
          content: 'Curated collection of private online developer & file utilities. Everything processes locally in your browser with zero data uploads.'
        },
        { property: 'og:image', content: 'https://everyday-use-tools.vercel.app/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'ToolBox - Private In-Browser Online Utilities' },

        // Twitter Cards
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'ToolBox - Fast, Private, In-Browser Online Utilities' },
        {
          name: 'twitter:description',
          content: 'Curated collection of private online utilities. Process PDFs, images, JSON, and QR codes directly in your browser.'
        },
        { name: 'twitter:image', content: 'https://everyday-use-tools.vercel.app/og-image.jpg' },
        { name: 'twitter:image:alt', content: 'ToolBox Online Utilities Preview' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap' }
      ]
    }
  }
})
