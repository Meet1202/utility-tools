<script setup lang="ts">
import { ref, computed } from 'vue'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import FileDropzone from '~/components/tools/FileDropzone.vue'
import ResultPanel from '~/components/tools/ResultPanel.vue'
import { parseRangeGroups } from '~/utils/pdf'
import { useDownload } from '~/composables/useDownload'

const { downloadBlob } = useDownload()

const selectedFile = ref<File | null>(null)
const pageCount = ref(0)
const splitMode = ref<'range' | 'all' | 'everyN'>('range')
const rangeInput = ref('1-2')
const rangeOutputMode = ref<'separate' | 'merged'>('separate')
const everyNValue = ref(1)

const isProcessing = ref(false)
const errorMessage = ref<string | null>(null)
const resultBlob = ref<Blob | null>(null)
const resultFilename = ref('split_output.pdf')

// Computed preview of parsed ranges
const parsedRangeInfo = computed(() => {
  if (pageCount.value <= 0 || !rangeInput.value) return null
  return parseRangeGroups(rangeInput.value, pageCount.value)
})

async function onFileSelected(files: File[]) {
  if (files.length === 0) return
  const file = files[0]
  selectedFile.value = file
  resultBlob.value = null
  errorMessage.value = null

  // Yield main thread before heavy PDF parsing (prevents Android Chrome OOM crash)
  await new Promise<void>(resolve => setTimeout(resolve, 100))

  try {
    const buffer = await file.arrayBuffer()
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
    pageCount.value = doc.getPageCount()
    rangeInput.value = pageCount.value > 2 ? `1-2, ${Math.min(3, pageCount.value)}` : pageCount.value === 2 ? '1, 2' : '1'
  } catch (err: any) {
    errorMessage.value = `Failed to open PDF: ${err.message || 'File may be encrypted or corrupted'}`
    selectedFile.value = null
  }
}

async function runSplit() {
  if (!selectedFile.value) return
  isProcessing.value = true
  errorMessage.value = null
  resultBlob.value = null

  try {
    const buffer = await selectedFile.value.arrayBuffer()
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
    const total = srcDoc.getPageCount()
    const baseName = selectedFile.value.name.replace(/\.pdf$/i, '')

    if (splitMode.value === 'range') {
      const parsed = parseRangeGroups(rangeInput.value, total)
      if (parsed.groups.length === 0) {
        throw new Error('Please specify valid page numbers within range 1 to ' + total)
      }

      if (rangeOutputMode.value === 'merged' || parsed.groups.length === 1) {
        // Output as single PDF
        const newDoc = await PDFDocument.create()
        const indicesToCopy = rangeOutputMode.value === 'merged'
          ? parsed.allIndices
          : parsed.groups[0].pages

        const copied = await newDoc.copyPages(srcDoc, indicesToCopy)
        copied.forEach(p => newDoc.addPage(p))

        const bytes = await newDoc.save({ useObjectStreams: true })
        resultBlob.value = new Blob([bytes], { type: 'application/pdf' })
        const label = parsed.groups.length === 1 ? parsed.groups[0].label : 'selected_pages'
        resultFilename.value = `${baseName}_${label}.pdf`
      } else {
        // Output each range as separate PDF inside a ZIP
        const zip = new JSZip()
        for (let i = 0; i < parsed.groups.length; i++) {
          const group = parsed.groups[i]
          const chunkDoc = await PDFDocument.create()
          const copied = await chunkDoc.copyPages(srcDoc, group.pages)
          copied.forEach(p => chunkDoc.addPage(p))
          const bytes = await chunkDoc.save({ useObjectStreams: true })
          zip.file(`${baseName}_${group.label}.pdf`, bytes)
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        resultBlob.value = zipBlob
        resultFilename.value = `${baseName}_split_ranges.zip`
      }
    } else if (splitMode.value === 'all') {
      // Extract every page as individual PDF into a ZIP
      const zip = new JSZip()
      for (let i = 0; i < total; i++) {
        const singleDoc = await PDFDocument.create()
        const [copied] = await singleDoc.copyPages(srcDoc, [i])
        singleDoc.addPage(copied)
        const bytes = await singleDoc.save()
        zip.file(`${baseName}_page_${i + 1}.pdf`, bytes)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      resultBlob.value = zipBlob
      resultFilename.value = `${baseName}_all_${total}_pages.zip`
    } else if (splitMode.value === 'everyN') {
      const n = Math.max(1, everyNValue.value)
      const zip = new JSZip()
      let chunkIdx = 1

      for (let i = 0; i < total; i += n) {
        const chunkIndices: number[] = []
        for (let j = i; j < Math.min(total, i + n); j++) {
          chunkIndices.push(j)
        }
        const chunkDoc = await PDFDocument.create()
        const copied = await chunkDoc.copyPages(srcDoc, chunkIndices)
        copied.forEach(p => chunkDoc.addPage(p))
        const bytes = await chunkDoc.save()
        zip.file(`${baseName}_part_${chunkIdx}_pages_${i + 1}-${Math.min(total, i + n)}.pdf`, bytes)
        chunkIdx++
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      resultBlob.value = zipBlob
      resultFilename.value = `${baseName}_chunks_every_${n}_pages.zip`
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Error occurred while splitting PDF'
  } finally {
    isProcessing.value = false
  }
}

function downloadResult() {
  if (resultBlob.value) {
    downloadBlob(resultBlob.value, resultFilename.value)
  }
}

function resetAll() {
  selectedFile.value = null
  pageCount.value = 0
  resultBlob.value = null
  errorMessage.value = null
}
</script>

<template>
  <div class="space-y-6">
    <FileDropzone
      v-if="!selectedFile"
      title="Drop PDF file here to split"
      subtitle="Extract pages, split by ranges, or burst into ZIP. 100% in-browser."
      accept="application/pdf"
      :multiple="false"
      @files-selected="onFileSelected"
    />

    <div v-else class="space-y-6">
      <!-- File Info Banner -->
      <div class="p-4 sm:p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
            PDF
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{{ selectedFile.name }}</h3>
            <p class="text-xs text-slate-500">{{ pageCount }} Total Pages • {{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
          </div>
        </div>
        <button type="button" class="text-xs font-semibold text-rose-600 hover:underline" @click="resetAll">
          Choose Different File
        </button>
      </div>

      <!-- Split Options -->
      <div class="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            class="p-3.5 rounded-xl border text-left transition-all"
            :class="splitMode === 'range' ? 'bg-brand-600 text-white border-brand-600 shadow-xs' : 'glass-card border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'"
            @click="splitMode = 'range'"
          >
            <div class="text-xs font-bold">Custom Page Range</div>
            <div class="text-[11px] opacity-75 mt-0.5">e.g. 1-3, 5, 8-10</div>
          </button>

          <button
            type="button"
            class="p-3.5 rounded-xl border text-left transition-all"
            :class="splitMode === 'all' ? 'bg-brand-600 text-white border-brand-600 shadow-xs' : 'glass-card border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'"
            @click="splitMode = 'all'"
          >
            <div class="text-xs font-bold">Extract Every Page</div>
            <div class="text-[11px] opacity-75 mt-0.5">All {{ pageCount }} pages as ZIP</div>
          </button>

          <button
            type="button"
            class="p-3.5 rounded-xl border text-left transition-all"
            :class="splitMode === 'everyN' ? 'bg-brand-600 text-white border-brand-600 shadow-xs' : 'glass-card border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'"
            @click="splitMode = 'everyN'"
          >
            <div class="text-xs font-bold">Split Every N Pages</div>
            <div class="text-[11px] opacity-75 mt-0.5">Chunk documents</div>
          </button>
        </div>

        <!-- Custom Range Input -->
        <div v-if="splitMode === 'range'" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Page Ranges (Max {{ pageCount }} pages)
            </label>
            <input
              v-model="rangeInput"
              type="text"
              placeholder="e.g. 1-3, 5, 8-10"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 font-mono text-sm focus:ring-2 focus:ring-brand-500"
            />
            <p class="text-[11px] text-slate-400 mt-1">
              Separate ranges with commas. Examples: <span class="font-mono text-slate-600 dark:text-slate-300">1-3, 5</span> or <span class="font-mono text-slate-600 dark:text-slate-300">2-4</span>
            </p>
          </div>

          <!-- Live Preview of Parsed Ranges -->
          <div v-if="parsedRangeInfo && parsedRangeInfo.groups.length > 0" class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div class="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Detected {{ parsedRangeInfo.groups.length }} Output {{ parsedRangeInfo.groups.length > 1 ? 'Files' : 'Range' }}</span>
              <span class="text-[11px] font-mono text-brand-600 dark:text-brand-400">{{ parsedRangeInfo.allIndices.length }} Total Pages Selected</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="grp in parsedRangeInfo.groups"
                :key="grp.label"
                class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800"
              >
                📄 {{ grp.displayString }}
              </span>
            </div>
          </div>

          <!-- Range Output Mode (When multiple ranges exist) -->
          <div v-if="parsedRangeInfo && parsedRangeInfo.groups.length > 1" class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Output Format
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                class="p-3 rounded-xl border text-left text-xs transition-all"
                :class="rangeOutputMode === 'separate' ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'"
                @click="rangeOutputMode = 'separate'"
              >
                🗂️ Separate PDF for Each Range (ZIP)
                <div class="text-[11px] font-normal opacity-75 mt-0.5">Creates {{ parsedRangeInfo.groups.length }} distinct PDFs</div>
              </button>
              <button
                type="button"
                class="p-3 rounded-xl border text-left text-xs transition-all"
                :class="rangeOutputMode === 'merged' ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'"
                @click="rangeOutputMode = 'merged'"
              >
                📑 Merge All Selected Pages into 1 PDF
                <div class="text-[11px] font-normal opacity-75 mt-0.5">Combines all {{ parsedRangeInfo.allIndices.length }} pages together</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Split Every N Input -->
        <div v-else-if="splitMode === 'everyN'" class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Pages Per Document Chunk
          </label>
          <input
            v-model.number="everyNValue"
            type="number"
            min="1"
            :max="pageCount"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 font-mono text-sm"
          />
          <p class="text-[11px] text-slate-400">
            Will generate {{ Math.ceil(pageCount / Math.max(1, everyNValue)) }} files in a ZIP.
          </p>
        </div>

        <button
          type="button"
          :disabled="isProcessing"
          class="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          @click="runSplit"
        >
          <svg v-if="isProcessing" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span v-if="isProcessing">Splitting Document...</span>
          <span v-else>Split & Download PDF</span>
        </button>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
        {{ errorMessage }}
      </div>

      <!-- Result Panel -->
      <ResultPanel
        v-if="resultBlob"
        title="Splitting Complete"
        :show-copy="false"
        :show-download="true"
        :download-filename="resultFilename"
        @download="downloadResult"
        @reset="resetAll"
      >
        <div class="p-6 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">Output Ready for Download</h4>
          <p class="text-xs text-slate-500 font-mono">{{ resultFilename }}</p>
        </div>
      </ResultPanel>
    </div>
  </div>
</template>
