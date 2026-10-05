<script setup lang="ts">
import { ref } from 'vue'
import FileDropzone from '~/components/tools/FileDropzone.vue'

const rawLog = ref<string[]>([])

function logMsg(msg: string) {
  rawLog.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
}

function onRawChange(e: Event, source: string) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const names = Array.from(target.files).map(f => `${f.name} (${(f.size / 1024).toFixed(1)} KB)`).join(', ')
    logMsg(`Selected via ${source}: ${names}`)
  } else {
    logMsg(`No files selected via ${source}`)
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-12 space-y-8">
    <div class="text-center space-y-2">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Android File Picker Diagnostic</h1>
      <p class="text-sm text-slate-600 dark:text-slate-400">
        Test each button below to identify if the issue is Android OS permissions, DocumentsUI, or the custom dropzone.
      </p>
    </div>

    <!-- Test 1: Plain HTML Input -->
    <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <h2 class="text-sm font-bold uppercase tracking-wider text-brand-600">Test 1: Plain Unstyled Input (No accept filter)</h2>
      <p class="text-xs text-slate-500">Pure HTML standard file input without any styles or wrappers.</p>
      <input
        type="file"
        @change="(e) => onRawChange(e, 'Test 1 (Plain)')"
      />
    </div>

    <!-- Test 2: Standard HTML Button with click() -->
    <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <h2 class="text-sm font-bold uppercase tracking-wider text-brand-600">Test 2: Plain HTML Input (With accept="application/pdf")</h2>
      <p class="text-xs text-slate-500">Pure HTML file input with standard PDF accept filter.</p>
      <input
        type="file"
        accept="application/pdf"
        @change="(e) => onRawChange(e, 'Test 2 (PDF accept)')"
      />
    </div>

    <!-- Test 3: The Custom FileDropzone -->
    <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <h2 class="text-sm font-bold uppercase tracking-wider text-brand-600">Test 3: Toolbox FileDropzone</h2>
      <p class="text-xs text-slate-500">The actual project dropzone component.</p>
      <FileDropzone
        title="Tap to choose file"
        subtitle="Testing dropzone on Android"
        accept="application/pdf"
        @files-selected="(files) => logMsg(`Dropzone emitted: ${files.map(f => f.name).join(', ')}`)"
      />
    </div>

    <!-- Event Logs -->
    <div v-if="rawLog.length > 0" class="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs space-y-1">
      <div class="font-bold text-slate-400 border-b border-slate-800 pb-1 mb-2">Event Logs:</div>
      <div v-for="(item, idx) in rawLog" :key="idx">{{ item }}</div>
    </div>
  </div>
</template>
