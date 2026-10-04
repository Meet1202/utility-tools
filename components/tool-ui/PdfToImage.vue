<script setup lang="ts">
import { ref } from 'vue'
import JSZip from 'jszip'
import FileDropzone from '~/components/tools/FileDropzone.vue'
import ResultPanel from '~/components/tools/ResultPanel.vue'
import { parseRangeGroups } from '~/utils/pdf'
import { useDownload } from '~/composables/useDownload'

interface ExtractedPage {
  pageNumber: number
  width: number
  height: number
  dataUrl: string
  blob: Blob
}

const { downloadBlob } = useDownload()

const selectedFile = ref<File | null>(null)
const pageCount = ref(0)
const imageFormat = ref<'image/png' | 'image/jpeg'>('image/png')
const resolutionScale = ref<number>(1.5)
const pageSelectionMode = ref<'all' | 'custom'>('all')
const customPagesInput = ref('1')

const isProcessing = ref(false)
const progressCurrent = ref(0)
const progressTotal = ref(0)
const errorMessage = ref<string | null>(null)
const extractedPages = ref<ExtractedPage[]>([])

let pdfjsLib: any = null

async function getPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    }
  }
  return pdfjsLib
}

async function onFileSelected(files: File[]) {
  if (files.length === 0) return
  const file = files[0]
  selectedFile.value = file
  extractedPages.value = []
  errorMessage.value = null

  try {
    const pdfjs = await getPdfJs()
    const buffer = await file.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: buffer })
    const pdf = await loadingTask.promise
    pageCount.value = pdf.numPages
    customPagesInput.value = pageCount.value > 1 ? `1-${Math.min(3, pageCount.value)}` : '1'
  } catch (err: any) {
    errorMessage.value = `Failed to open PDF: ${err.message || 'File may be encrypted or corrupted'}`
    selectedFile.value = null
  }
}

async function convertPdfToImages() {
  if (!selectedFile.value) return
  isProcessing.value = true
  errorMessage.value = null
  extractedPages.value = []

  try {
    const pdfjs = await getPdfJs()
    const buffer = await selectedFile.value.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: buffer })
    const pdf = await loadingTask.promise
    const total = pdf.numPages
    const scale = resolutionScale.value

    let pagesToRender: number[] = []
    if (pageSelectionMode.value === 'all') {
      pagesToRender = Array.from({ length: total }, (_, i) => i + 1)
    } else {
      const parsed = parseRangeGroups(customPagesInput.value, total)
      pagesToRender = parsed.allIndices.map(i => i + 1)
      if (pagesToRender.length === 0) {
        throw new Error(`Please specify valid pages between 1 and ${total}`)
      }
    }

    progressTotal.value = pagesToRender.length
    progressCurrent.value = 0

    for (const pageNum of pagesToRender) {
      progressCurrent.value++
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')

      if (ctx) {
        // Fill pure white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Render actual PDF page content with PDF.js
        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise

        const mime = imageFormat.value
        const quality = 0.92
        const dataUrl = canvas.toDataURL(mime, quality)

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b || new Blob()), mime, quality)
        })

        extractedPages.value.push({
          pageNumber: pageNum,
          width: viewport.width,
          height: viewport.height,
          dataUrl,
          blob
        })
      }
    }
  } catch (err: any) {
    errorMessage.value = `Rendering failed: ${err.message || 'An error occurred while converting PDF pages'}`
  } finally {
    isProcessing.value = false
  }
}

function downloadSinglePage(page: ExtractedPage) {
  const ext = imageFormat.value === 'image/jpeg' ? 'jpg' : 'png'
  const baseName = selectedFile.value?.name.replace(/\.pdf$/i, '') || 'document'
  downloadBlob(page.blob, `${baseName}_page_${page.pageNumber}.${ext}`)
}

async function downloadAllZip() {
  if (extractedPages.value.length === 0) return
  const zip = new JSZip()
  const ext = imageFormat.value === 'image/jpeg' ? 'jpg' : 'png'
  const baseName = selectedFile.value?.name.replace(/\.pdf$/i, '') || 'document'

  for (const page of extractedPages.value) {
    zip.file(`${baseName}_page_${page.pageNumber}.${ext}`, page.blob)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(zipBlob, `${baseName}_extracted_images.zip`)
}

function resetAll() {
  selectedFile.value = null
  pageCount.value = 0
  extractedPages.value = []
  errorMessage.value = null
}
</script>

<template>
  <div class="space-y-6">
    <FileDropzone
      v-if="!selectedFile"
      title="Drop PDF file to extract images"
      subtitle="Render document pages into crisp PNG or JPG pictures with high fidelity."
      accept=".pdf,application/pdf"
      :multiple="false"
      @files-selected="onFileSelected"
    />

    <div v-else class="space-y-6">
      <div class="p-4 sm:p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{{ selectedFile.name }}</h3>
          <p class="text-xs text-slate-500">{{ pageCount }} Pages • {{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
        </div>
        <button type="button" class="text-xs font-semibold text-rose-600 hover:underline" @click="resetAll">
          Change File
        </button>
      </div>

      <!-- Controls -->
      <div class="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Output Image Format
            </label>
            <select v-model="imageFormat" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-xs">
              <option value="image/png">PNG (Lossless & Sharp)</option>
              <option value="image/jpeg">JPG (Smaller File Size)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Resolution Scale / DPI
            </label>
            <select v-model.number="resolutionScale" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-xs">
              <option :value="1.0">1.0x (Standard Web - 72 DPI)</option>
              <option :value="1.5">1.5x (High Clarity - 108 DPI)</option>
              <option :value="2.0">2.0x (Ultra HD / Print - 144 DPI)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Pages to Convert
            </label>
            <select v-model="pageSelectionMode" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-xs">
              <option value="all">All Pages (1 to {{ pageCount }})</option>
              <option value="custom">Custom Pages / Range</option>
            </select>
          </div>
        </div>

        <div v-if="pageSelectionMode === 'custom'" class="pt-2">
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Specify Page Numbers / Ranges
          </label>
          <input
            v-model="customPagesInput"
            type="text"
            placeholder="e.g. 1-3, 5"
            class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 font-mono text-xs"
          />
        </div>

        <button
          type="button"
          :disabled="isProcessing"
          class="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          @click="convertPdfToImages"
        >
          <svg v-if="isProcessing" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span v-if="isProcessing">
            Rendering Page {{ progressCurrent }} of {{ progressTotal }}...
          </span>
          <span v-else>
            Convert Pages to {{ imageFormat === 'image/png' ? 'PNG' : 'JPG' }}
          </span>
        </button>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
        {{ errorMessage }}
      </div>

      <!-- Results Grid -->
      <div v-if="extractedPages.length > 0" class="space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
            Rendered {{ extractedPages.length }} Page Image{{ extractedPages.length > 1 ? 's' : '' }}
          </span>
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5"
            @click="downloadAllZip"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download All as ZIP
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="page in extractedPages"
            :key="page.pageNumber"
            class="p-3.5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-center shadow-xs"
          >
            <div class="aspect-3/4 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
              <img :src="page.dataUrl" :alt="`Page ${page.pageNumber}`" class="w-full h-full object-contain shadow-xs" />
            </div>
            <div class="flex items-center justify-between text-xs px-1">
              <span class="font-bold text-slate-800 dark:text-slate-200">Page {{ page.pageNumber }}</span>
              <span class="text-[11px] text-slate-400 font-mono">{{ page.width }}x{{ page.height }}px</span>
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950 dark:hover:bg-brand-900 dark:text-brand-300 font-semibold"
                @click="downloadSinglePage(page)"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
