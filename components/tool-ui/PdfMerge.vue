<script setup lang="ts">
import { ref } from 'vue'
import { PDFDocument } from 'pdf-lib'
import FileDropzone from '~/components/tools/FileDropzone.vue'
import ResultPanel from '~/components/tools/ResultPanel.vue'
import { useDownload } from '~/composables/useDownload'

interface PdfFileItem {
  id: string
  file: File
  name: string
  size: number
  pageCount: number
}

const { downloadBlob } = useDownload()

const pdfList = ref<PdfFileItem[]>([])
const isMerging = ref(false)
const errorMessage = ref<string | null>(null)
const mergedPdfBytes = ref<Uint8Array | null>(null)
const originalTotalSize = ref(0)
const mergedSize = ref(0)
const totalPagesMerged = ref(0)

async function onFilesSelected(files: File[]) {
  errorMessage.value = null

  // Yield the main thread before any heavy PDF parsing.
  // On Android Chrome, doing heavy work (ArrayBuffer + pdf-lib parse) synchronously
  // right after the file picker closes can trigger an OOM tab crash.
  await new Promise<void>(resolve => setTimeout(resolve, 100))

  for (const file of files) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      continue
    }

    // Warn on very large files on mobile where memory is constrained
    const MOBILE_WARN_MB = 30
    if (file.size > MOBILE_WARN_MB * 1024 * 1024) {
      const proceed = confirm(
        `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. ` +
        `Large files may be slow or crash on mobile. Continue?`
      )
      if (!proceed) continue
    }

    try {
      const buffer = await file.arrayBuffer()
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      pdfList.value.push({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: file.size,
        pageCount: doc.getPageCount()
      })
    } catch (err: any) {
      errorMessage.value = `Failed to load "${file.name}": ${err.message || 'File may be password-protected or corrupt'}`
    }
  }
}

function moveUp(index: number) {
  if (index <= 0) return
  const item = pdfList.value.splice(index, 1)[0]
  pdfList.value.splice(index - 1, 0, item)
}

function moveDown(index: number) {
  if (index >= pdfList.value.length - 1) return
  const item = pdfList.value.splice(index, 1)[0]
  pdfList.value.splice(index + 1, 0, item)
}

function removeFile(index: number) {
  pdfList.value.splice(index, 1)
  mergedPdfBytes.value = null
}

async function mergePdfs() {
  if (pdfList.value.length < 2) {
    errorMessage.value = 'Please select at least two PDF files to merge.'
    return
  }

  isMerging.value = true
  errorMessage.value = null
  mergedPdfBytes.value = null

  try {
    const mergedDoc = await PDFDocument.create()
    let rawTotalSize = 0
    let pageSum = 0

    for (const item of pdfList.value) {
      rawTotalSize += item.size
      pageSum += item.pageCount
      const arrayBuffer = await item.file.arrayBuffer()
      const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices())
      copiedPages.forEach(p => mergedDoc.addPage(p))
    }

    const bytes = await mergedDoc.save({ useObjectStreams: true })
    mergedPdfBytes.value = bytes
    originalTotalSize.value = rawTotalSize
    mergedSize.value = bytes.byteLength
    totalPagesMerged.value = pageSum
  } catch (err: any) {
    errorMessage.value = `Merge failed: ${err.message}`
  } finally {
    isMerging.value = false
  }
}

function downloadMerged() {
  if (mergedPdfBytes.value) {
    const blob = new Blob([mergedPdfBytes.value], { type: 'application/pdf' })
    downloadBlob(blob, 'merged-document.pdf')
  }
}

function resetAll() {
  pdfList.value = []
  mergedPdfBytes.value = null
  errorMessage.value = null
  originalTotalSize.value = 0
  mergedSize.value = 0
}
</script>

<template>
  <div class="space-y-6">
    <FileDropzone
      title="Drop PDF files here, or click to browse"
      subtitle="Select multiple PDFs to combine. Files stay 100% on your device."
      accept="application/pdf"
      :multiple="true"
      @files-selected="onFilesSelected"
    />

    <!-- Selected PDF List with reordering handles -->
    <div v-if="pdfList.length > 0" class="space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
          Files to Merge ({{ pdfList.length }}) • Drag or use arrows to reorder
        </span>
        <button
          type="button"
          class="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
          @click="resetAll"
        >
          Clear All
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="(item, idx) in pdfList"
          :key="item.id"
          class="flex items-center justify-between p-3.5 rounded-xl glass-card border border-slate-200/80 dark:border-slate-800 text-sm"
        >
          <div class="flex items-center gap-3 truncate mr-4">
            <span class="w-6 h-6 rounded-md bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 flex items-center justify-center text-xs font-bold shrink-0">
              {{ idx + 1 }}
            </span>
            <div class="truncate">
              <p class="font-semibold text-slate-900 dark:text-white truncate text-xs sm:text-sm">
                {{ item.name }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ item.pageCount }} {{ item.pageCount === 1 ? 'page' : 'pages' }} • {{ (item.size / 1024).toFixed(1) }} KB
              </p>
            </div>
          </div>

          <!-- Move Up/Down and Delete -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              :disabled="idx === 0"
              class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Move Up"
              @click="moveUp(idx)"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m18 15-6-6-6 6"/>
              </svg>
            </button>
            <button
              type="button"
              :disabled="idx === pdfList.length - 1"
              class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Move Down"
              @click="moveDown(idx)"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            <button
              type="button"
              class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-1"
              title="Remove"
              @click="removeFile(idx)"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="pt-2">
        <button
          type="button"
          :disabled="isMerging || pdfList.length < 2"
          class="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          @click="mergePdfs"
        >
          <svg v-if="isMerging" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span v-if="isMerging">Merging PDFs in Browser...</span>
          <span v-else>Merge {{ pdfList.length }} PDFs into One</span>
        </button>
      </div>
    </div>

    <!-- Error message -->
    <div
      v-if="errorMessage"
      class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm"
    >
      {{ errorMessage }}
    </div>

    <!-- Merged Result Panel -->
    <ResultPanel
      v-if="mergedPdfBytes"
      title="Merged Document Ready"
      :show-copy="false"
      :show-download="true"
      :original-size="originalTotalSize"
      :result-size="mergedSize"
      @download="downloadMerged"
      @reset="resetAll"
    >
      <div class="p-6 text-center space-y-3">
        <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h4 class="text-base font-bold text-slate-900 dark:text-white">PDFs Successfully Merged</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Combined {{ pdfList.length }} documents ({{ totalPagesMerged }} total pages) with zero data loss.
        </p>
      </div>
    </ResultPanel>
  </div>
</template>
