<script setup lang="ts">
import { ref, computed } from 'vue'
import JSZip from 'jszip'
import FileDropzone from '~/components/tools/FileDropzone.vue'
import { useDownload } from '~/composables/useDownload'

interface SourceFileItem {
  id: string
  file: File
  name: string
  size: number
  previewUrl: string
}

interface CompressedResultItem {
  id: string
  originalName: string
  outputName: string
  origSize: number
  compSize: number
  compBlob: Blob
  previewUrl: string
  savedPercent: number
  formatLabel: string
}

const { downloadBlob } = useDownload()

const quality = ref(75) // 10 to 95
const outputMode = ref<'auto' | 'jpeg' | 'webp' | 'original'>('auto')
const maxDimension = ref<number>(0) // 0 = original

const sourceFiles = ref<SourceFileItem[]>([])
const compressedResults = ref<CompressedResultItem[]>([])
const isProcessing = ref(false)
const errorMessage = ref<string | null>(null)

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to decode image "${file.name}"`))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`))
    reader.readAsDataURL(file)
  })
}

/**
 * Universal, 100% fail-safe canvas-to-blob encoder with toDataURL fallback.
 */
async function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  // 1. Try native toBlob
  const blob = await new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), mime, quality)
    } catch {
      resolve(null)
    }
  })

  if (blob && blob.size > 0) {
    return blob
  }

  // 2. Fallback to toDataURL (supported in 100% of browsers)
  let dataUrl: string
  try {
    dataUrl = canvas.toDataURL(mime, quality)
  } catch {
    // If specific mime (like webp) fails, fallback to jpeg
    dataUrl = canvas.toDataURL('image/jpeg', quality)
  }

  const parts = dataUrl.split(',')
  const detectedMime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const binaryStr = atob(parts[1])
  const len = binaryStr.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  return new Blob([bytes], { type: detectedMime })
}

async function onFilesSelected(files: File[]) {
  errorMessage.value = null

  for (const file of files) {
    const isImg = file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|svg)$/i.test(file.name)
    if (!isImg) continue

    // Avoid duplicates
    if (sourceFiles.value.some(s => s.name === file.name && s.size === file.size)) continue

    const previewUrl = URL.createObjectURL(file)
    sourceFiles.value.push({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      previewUrl
    })
  }

  // If results were previously shown, clear them so user can re-compress new batch
  if (compressedResults.value.length > 0) {
    compressedResults.value.forEach(r => URL.revokeObjectURL(r.previewUrl))
    compressedResults.value = []
  }
}

async function startCompression() {
  if (sourceFiles.value.length === 0) return
  isProcessing.value = true
  errorMessage.value = null

  // Clean old results
  compressedResults.value.forEach(r => URL.revokeObjectURL(r.previewUrl))
  compressedResults.value = []

  try {
    for (const item of sourceFiles.value) {
      const file = item.file
      const img = await loadImageFromFile(file)

      let width = img.naturalWidth || img.width
      let height = img.naturalHeight || img.height

      // Scale down if maxDimension limit is specified
      const maxDim = maxDimension.value
      if (maxDim > 0 && (width > maxDim || height > maxDim)) {
        if (width > height) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, width)
      canvas.height = Math.max(1, height)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not initialize canvas 2D context')

      // Select target mime and extension
      let mime = 'image/jpeg'
      let ext = 'jpg'

      if (outputMode.value === 'webp') {
        mime = 'image/webp'
        ext = 'webp'
      } else if (outputMode.value === 'auto') {
        // Auto: WebP if supported/modern, otherwise JPEG
        mime = 'image/webp'
        ext = 'webp'
      } else if (outputMode.value === 'original') {
        if (file.type === 'image/webp' || /\.webp$/i.test(file.name)) {
          mime = 'image/webp'
          ext = 'webp'
        } else if (file.type === 'image/png' || /\.png$/i.test(file.name)) {
          // PNG lossy compression is best handled via WebP to avoid bloat
          mime = 'image/webp'
          ext = 'webp'
        } else {
          mime = 'image/jpeg'
          ext = 'jpg'
        }
      }

      // If output is JPEG, paint white background so transparent areas do not turn black
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const qualityFactor = Math.min(1, Math.max(0.1, quality.value / 100))
      const compBlob = await canvasToBlob(canvas, mime, qualityFactor)
      const compUrl = URL.createObjectURL(compBlob)

      const baseName = file.name.replace(/\.[^/.]+$/, '')
      const outputName = `${baseName}.${ext}`
      const saved = Math.max(0, Math.round(((file.size - compBlob.size) / file.size) * 100))

      compressedResults.value.push({
        id: Math.random().toString(36).substring(7),
        originalName: file.name,
        outputName,
        origSize: file.size,
        compSize: compBlob.size,
        compBlob,
        previewUrl: compUrl,
        savedPercent: saved,
        formatLabel: ext.toUpperCase()
      })
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Error occurred while compressing images'
  } finally {
    isProcessing.value = false
  }
}

function downloadSingle(item: CompressedResultItem) {
  downloadBlob(item.compBlob, `compressed_${item.outputName}`)
}

async function downloadAllZip() {
  if (compressedResults.value.length === 0) return
  const zip = new JSZip()
  for (const item of compressedResults.value) {
    zip.file(`compressed_${item.outputName}`, item.compBlob)
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(zipBlob, 'compressed_images.zip')
}

function removeSourceFile(index: number) {
  URL.revokeObjectURL(sourceFiles.value[index].previewUrl)
  sourceFiles.value.splice(index, 1)
  if (sourceFiles.value.length === 0) {
    resetAll()
  }
}

function resetAll() {
  sourceFiles.value.forEach(s => URL.revokeObjectURL(s.previewUrl))
  compressedResults.value.forEach(r => URL.revokeObjectURL(r.previewUrl))
  sourceFiles.value = []
  compressedResults.value = []
  errorMessage.value = null
}

const totalOrig = computed(() => compressedResults.value.reduce((acc, i) => acc + i.origSize, 0))
const totalComp = computed(() => compressedResults.value.reduce((acc, i) => acc + i.compSize, 0))
const totalSaved = computed(() => {
  if (totalOrig.value <= 0) return 0
  return Math.max(0, Math.round(((totalOrig.value - totalComp.value) / totalOrig.value) * 100))
})
</script>

<template>
  <div class="space-y-6">
    <!-- Initial Dropzone (when no files chosen) -->
    <FileDropzone
      v-if="sourceFiles.length === 0"
      title="Drop JPG, PNG, or WebP images to compress"
      subtitle="Reduce image file size by up to 90% with live before/after comparison."
      accept="image/*,.jpg,.jpeg,.png,.webp,.bmp,.gif"
      :multiple="true"
      @files-selected="onFilesSelected"
    />

    <!-- When files are selected -->
    <div v-else class="space-y-6">
      <!-- Selected Files Overview Banner -->
      <div class="p-4 sm:p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
            {{ sourceFiles.length }}
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              {{ sourceFiles.length }} Image{{ sourceFiles.length > 1 ? 's' : '' }} Selected
            </h3>
            <p class="text-xs text-slate-500">
              Total Original Size: {{ formatBytes(sourceFiles.reduce((acc, f) => acc + f.size, 0)) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Add more files input trigger -->
          <label class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add More
            <input type="file" multiple accept="image/*,.jpg,.jpeg,.png,.webp,.bmp,.gif" class="hidden" @change="(e) => onFilesSelected(Array.from((e.target as HTMLInputElement).files || []))" />
          </label>
          <button type="button" class="text-xs font-semibold text-rose-600 hover:underline px-2 py-1" @click="resetAll">
            Clear All
          </button>
        </div>
      </div>

      <!-- Settings Panel -->
      <div class="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Quality Slider -->
          <div class="space-y-2 sm:col-span-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>Compression Level</span>
              <span class="text-sm font-mono text-brand-600 dark:text-brand-400 font-extrabold">{{ quality }}% Quality</span>
            </div>
            <input
              v-model.number="quality"
              type="range"
              min="10"
              max="95"
              class="w-full accent-brand-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div class="flex justify-between text-[11px] text-slate-400">
              <span>Smallest File (30%)</span>
              <span>Recommended (75%)</span>
              <span>Near Original (90%)</span>
            </div>
          </div>

          <!-- Format Strategy -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Output Format
            </label>
            <select
              v-model="outputMode"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-xs font-medium"
            >
              <option value="auto">Auto WebP (Recommended, -80%)</option>
              <option value="jpeg">Standard JPEG (.jpg)</option>
              <option value="webp">WebP (.webp)</option>
              <option value="original">Keep Original</option>
            </select>
          </div>
        </div>

        <!-- Optional Max Dimension Resize -->
        <div class="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span class="font-semibold text-slate-600 dark:text-slate-400">Resolution Limit (Optional, downsizes huge photos):</span>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg border text-xs font-medium transition-all"
              :class="maxDimension === 0 ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'"
              @click="maxDimension = 0"
            >
              Original Dimensions
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg border text-xs font-medium transition-all"
              :class="maxDimension === 2560 ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'"
              @click="maxDimension = 2560"
            >
              Max 2K (2560px)
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg border text-xs font-medium transition-all"
              :class="maxDimension === 1920 ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'"
              @click="maxDimension = 1920"
            >
              Max FHD (1920px)
            </button>
          </div>
        </div>

        <!-- PROMINENT ACTION BUTTON -->
        <button
          type="button"
          :disabled="isProcessing"
          class="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          @click="startCompression"
        >
          <svg v-if="isProcessing" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span v-if="isProcessing">Compressing {{ sourceFiles.length }} Image{{ sourceFiles.length > 1 ? 's' : '' }}...</span>
          <span v-else>⚡ Compress {{ sourceFiles.length }} Image{{ sourceFiles.length > 1 ? 's' : '' }} Now</span>
        </button>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
        {{ errorMessage }}
      </div>

      <!-- Batch Results Section (Shown after compression completes) -->
      <div v-if="compressedResults.length > 0" class="space-y-4">
        <!-- Savings Header Banner -->
        <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-brand-500/20">
          <div>
            <span class="text-xs font-semibold text-brand-100 uppercase tracking-wider">Compression Results</span>
            <div class="text-xl sm:text-2xl font-extrabold mt-0.5">
              {{ formatBytes(totalOrig) }} → {{ formatBytes(totalComp) }} ({{ totalSaved }}% saved)
            </div>
          </div>
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl bg-white text-brand-600 font-bold text-xs hover:bg-brand-50 transition-colors shadow-sm flex items-center gap-1.5"
            @click="downloadAllZip"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download All (ZIP)
          </button>
        </div>

        <!-- Grid of Results -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="item in compressedResults"
            :key="item.id"
            class="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs"
          >
            <div class="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700">
              <img :src="item.previewUrl" :alt="item.outputName" class="w-full h-full object-contain" />
            </div>

            <div>
              <div class="flex items-center justify-between gap-2">
                <p class="font-bold text-slate-900 dark:text-white text-xs truncate">{{ item.outputName }}</p>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {{ item.formatLabel }}
                </span>
              </div>
              <div class="mt-1 flex items-center justify-between text-xs">
                <span class="text-slate-400">{{ formatBytes(item.origSize) }} → <strong class="text-emerald-600 dark:text-emerald-400">{{ formatBytes(item.compSize) }}</strong></span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[11px]">
                  -{{ item.savedPercent }}%
                </span>
              </div>
            </div>

            <div class="pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                class="w-full py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5"
                @click="downloadSingle(item)"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Compressed Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
