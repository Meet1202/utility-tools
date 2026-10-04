<script setup lang="ts">
import { ref } from 'vue'
import { PDFDocument, PageSizes } from 'pdf-lib'
import FileDropzone from '~/components/tools/FileDropzone.vue'
import ResultPanel from '~/components/tools/ResultPanel.vue'
import { useDownload } from '~/composables/useDownload'

interface ImageItem {
  id: string
  file: File
  name: string
  previewUrl: string
  size: number
}

const { downloadBlob } = useDownload()

const images = ref<ImageItem[]>([])
const pageSize = ref<'A4' | 'Letter' | 'fit'>('A4')
const orientation = ref<'portrait' | 'landscape'>('portrait')
const margin = ref<number>(20) // points

const isGenerating = ref(false)
const errorMessage = ref<string | null>(null)
const generatedPdfBytes = ref<Uint8Array | null>(null)

function onFilesSelected(files: File[]) {
  for (const f of files) {
    if (!f.type.startsWith('image/')) continue
    const url = URL.createObjectURL(f)
    images.value.push({
      id: Math.random().toString(36).substring(7),
      file: f,
      name: f.name,
      previewUrl: url,
      size: f.size
    })
  }
}

function moveUp(index: number) {
  if (index <= 0) return
  const item = images.value.splice(index, 1)[0]
  images.value.splice(index - 1, 0, item)
}

function moveDown(index: number) {
  if (index >= images.value.length - 1) return
  const item = images.value.splice(index, 1)[0]
  images.value.splice(index + 1, 0, item)
}

function removeImage(index: number) {
  URL.revokeObjectURL(images.value[index].previewUrl)
  images.value.splice(index, 1)
}

// Convert image to clean PNG bytes using Canvas if it's WebP or arbitrary image
async function getImageBytes(file: File): Promise<{ bytes: Uint8Array; isPng: boolean }> {
  if (file.type === 'image/jpeg') {
    const arr = await file.arrayBuffer()
    return { bytes: new Uint8Array(arr), isPng: false }
  } else if (file.type === 'image/png') {
    const arr = await file.arrayBuffer()
    return { bytes: new Uint8Array(arr), isPng: true }
  } else {
    // Convert WebP / other to PNG via canvas
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)
        canvas.toBlob(async (blob) => {
          if (!blob) return reject(new Error('Canvas conversion failed'))
          const arr = await blob.arrayBuffer()
          resolve({ bytes: new Uint8Array(arr), isPng: true })
        }, 'image/png')
      }
      img.onerror = () => reject(new Error('Failed to load image for PDF embedding'))
      img.src = URL.createObjectURL(file)
    })
  }
}

async function generatePdf() {
  if (images.value.length === 0) return
  isGenerating.value = true
  errorMessage.value = null
  generatedPdfBytes.value = null

  try {
    const doc = await PDFDocument.create()

    for (const item of images.value) {
      const { bytes, isPng } = await getImageBytes(item.file)
      const embeddedImg = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)

      const imgWidth = embeddedImg.width
      const imgHeight = embeddedImg.height

      let pageWidth = 0
      let pageHeight = 0

      if (pageSize.value === 'fit') {
        pageWidth = imgWidth + margin.value * 2
        pageHeight = imgHeight + margin.value * 2
      } else {
        const standardDims = pageSize.value === 'Letter' ? PageSizes.Letter : PageSizes.A4
        if (orientation.value === 'landscape') {
          pageWidth = standardDims[1]
          pageHeight = standardDims[0]
        } else {
          pageWidth = standardDims[0]
          pageHeight = standardDims[1]
        }
      }

      const page = doc.addPage([pageWidth, pageHeight])

      // Fit image inside margins maintaining aspect ratio
      const availWidth = pageWidth - margin.value * 2
      const availHeight = pageHeight - margin.value * 2
      const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight)

      const finalWidth = imgWidth * scale
      const finalHeight = imgHeight * scale

      // Center horizontally and vertically
      const x = margin.value + (availWidth - finalWidth) / 2
      const y = margin.value + (availHeight - finalHeight) / 2

      page.drawImage(embeddedImg, {
        x,
        y,
        width: finalWidth,
        height: finalHeight
      })
    }

    const saved = await doc.save()
    generatedPdfBytes.value = saved
  } catch (err: any) {
    errorMessage.value = `PDF Generation failed: ${err.message}`
  } finally {
    isGenerating.value = false
  }
}

function downloadPdf() {
  if (generatedPdfBytes.value) {
    const blob = new Blob([generatedPdfBytes.value], { type: 'application/pdf' })
    downloadBlob(blob, 'images_combined.pdf')
  }
}

function resetAll() {
  images.value.forEach(img => URL.revokeObjectURL(img.previewUrl))
  images.value = []
  generatedPdfBytes.value = null
}
</script>

<template>
  <div class="space-y-6">
    <FileDropzone
      title="Drop JPG, PNG, or WebP images here"
      subtitle="Convert photos into a single neat PDF document. Reorder as needed."
      accept="image/*"
      :multiple="true"
      @files-selected="onFilesSelected"
    />

    <!-- Selected Images and Controls -->
    <div v-if="images.length > 0" class="space-y-6">
      <!-- Options Bar -->
      <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
          Page & Layout Settings
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Page Size -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Page Size</label>
            <select v-model="pageSize" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-xs">
              <option value="A4">A4 (Standard)</option>
              <option value="Letter">US Letter</option>
              <option value="fit">Fit to Image Dimensions</option>
            </select>
          </div>

          <!-- Orientation -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Orientation</label>
            <select
              v-model="orientation"
              :disabled="pageSize === 'fit'"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-xs disabled:opacity-50"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <!-- Margins -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Margins</label>
            <select v-model.number="margin" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-xs">
              <option :value="0">No Margins (0 pt)</option>
              <option :value="20">Small (20 pt)</option>
              <option :value="40">Large (40 pt)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Image Grid Previews -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-500 px-1">
          <span class="font-bold uppercase tracking-wider">Pages to Create ({{ images.length }})</span>
          <button type="button" class="hover:text-rose-600 font-semibold" @click="resetAll">Clear All</button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            v-for="(img, idx) in images"
            :key="img.id"
            class="p-2.5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-2 relative group"
          >
            <div class="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <img :src="img.previewUrl" :alt="img.name" class="w-full h-full object-cover" />
            </div>

            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-700 dark:text-slate-300">Page {{ idx + 1 }}</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  :disabled="idx === 0"
                  class="p-1 rounded disabled:opacity-30 hover:bg-slate-100"
                  @click="moveUp(idx)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  :disabled="idx === images.length - 1"
                  class="p-1 rounded disabled:opacity-30 hover:bg-slate-100"
                  @click="moveDown(idx)"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="p-1 rounded text-rose-500 hover:bg-rose-50"
                  @click="removeImage(idx)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button
        type="button"
        :disabled="isGenerating"
        class="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
        @click="generatePdf"
      >
        <svg v-if="isGenerating" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <span v-if="isGenerating">Generating PDF Document...</span>
        <span v-else>Generate PDF from {{ images.length }} Images</span>
      </button>

      <!-- Error -->
      <div v-if="errorMessage" class="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
        {{ errorMessage }}
      </div>

      <!-- Result Panel -->
      <ResultPanel
        v-if="generatedPdfBytes"
        title="PDF Document Ready"
        :show-copy="false"
        :show-download="true"
        :result-size="generatedPdfBytes.byteLength"
        download-filename="converted_images.pdf"
        @download="downloadPdf"
        @reset="resetAll"
      >
        <div class="p-6 text-center space-y-2">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">PDF Compiled Successfully</h4>
          <p class="text-xs text-slate-500">{{ images.length }} pages included.</p>
        </div>
      </ResultPanel>
    </div>
  </div>
</template>
