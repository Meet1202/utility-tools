<script setup lang="ts">
useSeoMeta({
  title: 'Privacy Policy & Data Security Guarantee | ToolBox',
  description: 'Our privacy guarantee: 100% of file processing and computation executes locally in your browser. We never upload your files or track your activity.',
  ogTitle: 'Privacy Policy & Data Security Guarantee | ToolBox',
  ogDescription: 'Files never leave your machine. Read our transparent client-side privacy architecture.'
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
    <div class="mb-10 text-center sm:text-left">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-4">
        <svg class="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        </svg>
        <span>Zero-Knowledge Architecture</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Privacy & Security Policy
      </h1>
      <p class="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300">
        We believe privacy should be default, absolute, and verifiable. Here is how ToolBox protects your data.
      </p>
    </div>

    <div class="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
      <!-- Section 1 -->
      <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-2 h-5 bg-brand-500 rounded-full inline-block"></span>
          1. 100% Client-Side Processing
        </h2>
        <p>
          Every single file conversion, compression, formatting, and calculation on ToolBox takes place <strong>entirely inside your browser's local sandbox</strong>. When you select a PDF, image, JSON string, or password parameter:
        </p>
        <ul class="list-disc list-inside mt-3 space-y-1.5 text-sm">
          <li>Your files are never transmitted across the internet to our servers or any third-party clouds.</li>
          <li>We operate no backend file storage, no processing queues, and no analytics databases.</li>
          <li>You can disconnect your internet connection after the page loads and the tools will continue working flawlessly.</li>
        </ul>
      </div>

      <!-- Section 2 -->
      <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-2 h-5 bg-brand-500 rounded-full inline-block"></span>
          2. External Network Calls & API Transparency
        </h2>
        <p>
          In full transparency, 95%+ of our tools make zero network requests of any kind. The only exceptions are specific informational lookup tools that query public read-only registries:
        </p>
        <div class="mt-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold">
              <tr>
                <th class="p-3">Tool</th>
                <th class="p-3">Purpose</th>
                <th class="p-3">Data Sent</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <td class="p-3 font-medium">Currency Converter</td>
                <td class="p-3">Fetches current exchange rate tables</td>
                <td class="p-3 text-emerald-600 dark:text-emerald-400">None (cached public rate table)</td>
              </tr>
              <tr>
                <td class="p-3 font-medium">IFSC Code Lookup</td>
                <td class="p-3">Queries official bank branch address directory</td>
                <td class="p-3">The requested IFSC code string only</td>
              </tr>
              <tr>
                <td class="p-3 font-medium">PIN Code Lookup</td>
                <td class="p-3">Queries public postal district directory</td>
                <td class="p-3">The requested 6-digit PIN code only</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
          All external API responses are aggressively cached in local memory to prevent unnecessary lookups.
        </p>
      </div>

      <!-- Section 3 -->
      <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span class="w-2 h-5 bg-brand-500 rounded-full inline-block"></span>
          3. Local Storage Policy
        </h2>
        <p>
          We use your browser’s standard <code>localStorage</code> strictly for convenience preferences that remain on your personal device:
        </p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-sm">
          <li>Your selected visual theme (Light, Dark, or System preference).</li>
          <li>Your list of favorited tools (saved as tool slugs).</li>
          <li>Your list of recently opened tools (capped at 8 items).</li>
        </ul>
        <p class="mt-3 text-sm">
          We never store personal data, passwords, or file contents in cookies or persistent remote tracking identifiers.
        </p>
      </div>
    </div>
  </div>
</template>
