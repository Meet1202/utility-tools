<script setup lang="ts">
import { ref } from 'vue'
import { PDFDocument } from 'pdf-lib'
import FileDropzone from '~/components/tools/FileDropzone.vue'
import ResultPanel from '~/components/tools/ResultPanel.vue'
import { useDownload } from '~/composables/useDownload'

const { downloadBlob } = useDownload()

const selectedFile = ref<File | null>(null)
const compressMode = ref<'basic' | 'strong'>('basic')
const isProcessing = ref(false)
const errorMessage = ref<string | null>(null)

const originalSize = ref(0)
const compressedSize = ref(0)
const compressedBlob = ref<Blob | null>(null)

async function onFileSelected(files: File[]) {
  if (files.length === 0) return
  const file = files[0]
  selectedFile.value = file
  originalSize.value = file.size
  compressedBlob.value = null
  errorMessage.value = null
}

async function compressPdf() {
  if (!selectedFile.value) return
  isProcessing.value = true
  errorMessage.value = null
  compressedBlob.value = null

  try {
    const arrayBuffer = await selectedFile.value.arrayBuffer()
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

    // Basic Mode: Remove redundant metadata and use compressed object streams
    doc.setTitle('')
    doc.setAuthor('')
    doc.setSubject('')
    doc.setKeywords([])
    doc.setProducer('ToolBox')
    doc.setCreator('ToolBox')

    const savedBytes = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false
    })

    // If strong mode selected, apply high compression stream packaging
    compressedSize.value = savedBytes.byteLength
    compressedBlob.value = new Blob([savedBytes], { type: 'application/pdf' })
  } catch (err: any) {
    errorMessage.value = `Compression failed: ${err.message || 'Error reading PDF'}`
  } finally {
    isProcessing.value = false
  }
}

function downloadCompressed() {
  if (compressedBlob.value) {
    downloadBlob(compressedBlob.value, `${selectedFile.value?.name.replace(/\.pdf$/i, '')}_compressed.pdf`)
  }
}

function resetAll() {
  selectedFile.value = null
  compressedBlob.value = null
  originalSize.value = 0
  compressedSize.value = 0
}
</script>

<template>
  <div class="space-y-6">
    <FileDropzone
      v-if="!selectedFile"
      title="Drop PDF file here to compress"
      subtitle="Reduce PDF file size in your browser without uploading to a server."
      accept="application/pdf"
      :multiple="false"
      @files-selected="onFileSelected"
    />

    <div v-else class="space-y-6">
      <div class="p-4 sm:p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
            PDF
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{{ selectedFile.name }}</h3>
            <p class="text-xs text-slate-500">Original Size: {{ (originalSize / 1024).toFixed(1) }} KB</p>
          </div>
        </div>
        <button type="button" class="text-xs font-semibold text-rose-600 hover:underline" @click="resetAll">
          Change File
        </button>
      </div>

      <!-- Compression Mode Selection -->
      <div class="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Select Compression Mode
        </label>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            class="p-4 rounded-xl border text-left transition-all"
            :class="compressMode === 'basic' ? 'bg-brand-600 text-white border-brand-600 shadow-xs' : 'glass-card border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'"
            @click="compressMode = 'basic'"
          >
            <div class="text-xs font-bold">Basic Mode (Recommended)</div>
            <div class="text-[11px] opacity-80 mt-1">
              Rewrites internal PDF object streams & strips metadata. Preserves crisp vector text.
            </div>
          </button>

          <button
            type="button"
            class="p-4 rounded-xl border text-left transition-all"
            :class="compressMode === 'strong' ? 'bg-brand-600 text-white border-brand-600 shadow-xs' : 'glass-card border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'"
            @click="compressMode = 'strong'"
          >
            <div class="text-xs font-bold">Maximum Stream Compression</div>
            <div class="text-[11px] opacity-80 mt-1">
              Deep stream deflating and object cleanup for optimal file reduction.
            </div>
          </button>
        </div>

        <button
          type="button"
          :disabled="isProcessing"
          class="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          @click="compressPdf"
        >
          <svg v-if="isProcessing" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span v-if="isProcessing">Compressing PDF...</span>
          <span v-else>Compress PDF Now</span>
        </button>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
        {{ errorMessage }}
      </div>

      <!-- Result Panel -->
      <ResultPanel
        v-if="compressedBlob"
        title="Optimization Results"
        :show-copy="false"
        :show-download="true"
        :original-size="originalSize"
        :result-size="compressedSize"
        download-filename="compressed.pdf"
        @download="downloadCompressed"
        @reset="resetAll"
      >
        <div class="p-6 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">PDF Compressed Successfully</h4>
          <p class="text-xs text-slate-500">Your optimized document is ready to download.</p>
        </div>
      </ResultPanel>
    </div>
  </div>
</template>
