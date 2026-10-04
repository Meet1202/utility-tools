<script setup lang="ts">
import { ref, computed } from 'vue'
import JSZip from 'jszip'
import FileDropzone from '~/components/tools/FileDropzone.vue'
import {
  type TargetImageFormat,
  type ColorFilter,
  imageDataToBmp,
  pngToIco,
  applyCanvasFilter
} from '~/utils/imageFormat'
import { useDownload } from '~/composables/useDownload'

interface SourceFileItem {
  id: string
  file: File
  name: string
  size: number
  previewUrl: string
  isHeic: boolean
}

interface ConvertedResultItem {
  id: string
  originalName: string
  targetName: string
  origSize: number
  newSize: number
  blob: Blob
  previewUrl: string
  formatLabel: string
}

const { downloadBlob } = useDownload()

// Conversion settings
const targetFormat = ref<TargetImageFormat>('image/webp')
const quality = ref(90) // 10 to 100
const colorFilter = ref<ColorFilter>('none')
const bgFillType = ref<'white' | 'black' | 'custom' | 'transparent'>('white')
const customBgColor = ref('#ffffff')

// Resize & Scaling controls
const scaleMode = ref<'original' | 'percent' | 'maxDim' | 'custom'>('original')
const scalePercent = ref(100)
const maxDimValue = ref(1920)
const customWidth = ref(800)
const customHeight = ref(600)
const lockAspectRatio = ref(true)
const icoSize = ref(32) // for ICO output
const filenamePrefix = ref('')

const sourceFiles = ref<SourceFileItem[]>([])
const convertedResults = ref<ConvertedResultItem[]>([])
const isProcessing = ref(false)
const progressStatus = ref('')
const errorMessage = ref<string | null>(null)

// Lazy load heic2any for iPhone photos
let heic2anyLib: any = null
async function getHeic2Any() {
  if (!heic2anyLib) {
    const mod = await import('heic2any')
    heic2anyLib = mod.default || mod
  }
  return heic2anyLib
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFormatMeta(format: TargetImageFormat): { ext: string; label: string; lossy: boolean } {
  switch (format) {
    case 'image/webp': return { ext: 'webp', label: 'WebP', lossy: true }
    case 'image/png': return { ext: 'png', label: 'PNG', lossy: false }
    case 'image/jpeg': return { ext: 'jpg', label: 'JPEG', lossy: true }
    case 'image/avif': return { ext: 'avif', label: 'AVIF', lossy: true }
    case 'image/bmp': return { ext: 'bmp', label: 'BMP', lossy: false }
    case 'image/x-icon': return { ext: 'ico', label: 'ICO (Favicon)', lossy: false }
    default: return { ext: 'jpg', label: 'JPEG', lossy: true }
  }
}

async function loadSourceAsImage(item: SourceFileItem): Promise<HTMLImageElement> {
  let fileToLoad: Blob = item.file

  // If iPhone HEIC/HEIF photo, convert to JPEG blob first using heic2any
  if (item.isHeic) {
    progressStatus.value = `Decoding iPhone HEIC photo "${item.name}"...`
    const heic2any = await getHeic2Any()
    const convertedBlob = await heic2any({
      blob: item.file,
      toType: 'image/jpeg',
      quality: 0.95
    })
    fileToLoad = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to decode image "${item.name}"`))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error(`Could not read file "${item.name}"`))
    reader.readAsDataURL(fileToLoad)
  })
}

/**
 * Universal canvas-to-blob encoder supporting WebP, PNG, JPEG, AVIF with fallbacks.
 */
async function canvasToBlob(canvas: HTMLCanvasElement, mime: string, qualityFactor: number): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), mime, qualityFactor)
    } catch {
      resolve(null)
    }
  })

  if (blob && blob.size > 0) return blob

  // Fallback to toDataURL
  let dataUrl: string
  try {
    dataUrl = canvas.toDataURL(mime, qualityFactor)
  } catch {
    dataUrl = canvas.toDataURL(mime === 'image/png' ? 'image/png' : 'image/jpeg', qualityFactor)
  }

  const parts = dataUrl.split(',')
  const detectedMime = parts[0].match(/:(.*?);/)?.[1] || mime
  const bstr = atob(parts[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: detectedMime })
}

async function onFilesSelected(files: File[]) {
  errorMessage.value = null

  for (const file of files) {
    const isHeic = /\.(heic|heif)$/i.test(file.name)
    const isStandardImg = file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|svg|ico)$/i.test(file.name)

    if (!isHeic && !isStandardImg) continue
    if (sourceFiles.value.some(s => s.name === file.name && s.size === file.size)) continue

    let previewUrl = ''
    if (!isHeic) {
      previewUrl = URL.createObjectURL(file)
    }

    sourceFiles.value.push({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      previewUrl,
      isHeic
    })
  }

  if (convertedResults.value.length > 0) {
    convertedResults.value.forEach(r => URL.revokeObjectURL(r.previewUrl))
    convertedResults.value = []
  }
}

async function startConversion() {
  if (sourceFiles.value.length === 0) return
  isProcessing.value = true
  errorMessage.value = null
  progressStatus.value = 'Preparing images...'

  convertedResults.value.forEach(r => URL.revokeObjectURL(r.previewUrl))
  convertedResults.value = []

  const { ext, label } = getFormatMeta(targetFormat.value)
  const isLossy = targetFormat.value === 'image/jpeg' || targetFormat.value === 'image/webp' || targetFormat.value === 'image/avif'
  const qualityFactor = isLossy ? Math.min(1, Math.max(0.1, quality.value / 100)) : 1.0

  try {
    for (let i = 0; i < sourceFiles.value.length; i++) {
      const item = sourceFiles.value[i]
      progressStatus.value = `Converting ${i + 1} of ${sourceFiles.value.length}: "${item.name}"...`

      const img = await loadSourceAsImage(item)
      let origW = img.naturalWidth || img.width
      let origH = img.naturalHeight || img.height

      // Calculate Target Dimensions
      let targetW = origW
      let targetH = origH

      if (targetFormat.value === 'image/x-icon') {
        targetW = icoSize.value
        targetH = icoSize.value
      } else if (scaleMode.value === 'percent') {
        const factor = Math.max(10, scalePercent.value) / 100
        targetW = Math.max(1, Math.round(origW * factor))
        targetH = Math.max(1, Math.round(origH * factor))
      } else if (scaleMode.value === 'maxDim') {
        const maxD = maxDimValue.value
        if (origW > maxD || origH > maxD) {
          if (origW > origH) {
            targetH = Math.round((origH * maxD) / origW)
            targetW = maxD
          } else {
            targetW = Math.round((origW * maxD) / origH)
            targetH = maxD
          }
        }
      } else if (scaleMode.value === 'custom') {
        targetW = Math.max(1, customWidth.value)
        targetH = Math.max(1, customHeight.value)
      }

      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get Canvas context')

      // Handle Background Fill for transparency (JPEG, BMP require solid background)
      const needsSolidBg = targetFormat.value === 'image/jpeg' || targetFormat.value === 'image/bmp'
      if (needsSolidBg || bgFillType.value !== 'transparent') {
        let fill = '#ffffff'
        if (bgFillType.value === 'black') fill = '#000000'
        else if (bgFillType.value === 'custom') fill = customBgColor.value
        ctx.fillStyle = fill
        ctx.fillRect(0, 0, targetW, targetH)
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, targetW, targetH)

      // Apply Color Filter if selected (Grayscale, Sepia, Invert)
      if (colorFilter.value !== 'none') {
        applyCanvasFilter(ctx, targetW, targetH, colorFilter.value)
      }

      let outputBlob: Blob

      // Format-specific encoding
      if (targetFormat.value === 'image/bmp') {
        const imgData = ctx.getImageData(0, 0, targetW, targetH)
        outputBlob = imageDataToBmp(imgData)
      } else if (targetFormat.value === 'image/x-icon') {
        // ICO: encode as PNG first, then wrap into ICO container
        const pngBlob = await canvasToBlob(canvas, 'image/png', 1.0)
        outputBlob = await pngToIco(pngBlob, targetW, targetH)
      } else {
        outputBlob = await canvasToBlob(canvas, targetFormat.value, qualityFactor)
      }

      const url = URL.createObjectURL(outputBlob)
      const baseName = item.name.replace(/\.[^/.]+$/, '')
      const prefix = filenamePrefix.value ? `${filenamePrefix.value.trim()}_` : ''
      const targetName = `${prefix}${baseName}.${ext}`

      convertedResults.value.push({
        id: Math.random().toString(36).substring(7),
        originalName: item.name,
        targetName,
        origSize: item.size,
        newSize: outputBlob.size,
        blob: outputBlob,
        previewUrl: url,
        formatLabel: label
      })
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'An error occurred during conversion'
  } finally {
    isProcessing.value = false
    progressStatus.value = ''
  }
}

function downloadSingle(item: ConvertedResultItem) {
  downloadBlob(item.blob, item.targetName)
}

async function downloadAllZip() {
  if (convertedResults.value.length === 0) return
  const zip = new JSZip()
  for (const item of convertedResults.value) {
    zip.file(item.targetName, item.blob)
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(zipBlob, `converted_${getFormatMeta(targetFormat.value).ext}_images.zip`)
}

function removeSourceFile(index: number) {
  if (sourceFiles.value[index].previewUrl) {
    URL.revokeObjectURL(sourceFiles.value[index].previewUrl)
  }
  sourceFiles.value.splice(index, 1)
  if (sourceFiles.value.length === 0) {
    resetAll()
  }
}

function resetAll() {
  sourceFiles.value.forEach(s => { if (s.previewUrl) URL.revokeObjectURL(s.previewUrl) })
  convertedResults.value.forEach(r => URL.revokeObjectURL(r.previewUrl))
  sourceFiles.value = []
  convertedResults.value = []
  errorMessage.value = null
  progressStatus.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- Initial Dropzone (when no files chosen) -->
    <FileDropzone
      v-if="sourceFiles.length === 0"
      title="Drop images here to convert format"
      subtitle="Convert JPG, PNG, WebP, AVIF, BMP, ICO, and Apple HEIC photos. 100% in-browser."
      accept="image/*,.jpg,.jpeg,.png,.webp,.bmp,.gif,.svg,.ico,.heic,.heif"
      :multiple="true"
      @files-selected="onFilesSelected"
    />

    <!-- When files are selected -->
    <div v-else class="space-y-6">
      <!-- Selected Files Banner -->
      <div class="p-4 sm:p-5 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
            {{ sourceFiles.length }}
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              {{ sourceFiles.length }} Image{{ sourceFiles.length > 1 ? 's' : '' }} Ready for Conversion
            </h3>
            <p class="text-xs text-slate-500">
              Total Input Size: {{ formatBytes(sourceFiles.reduce((acc, f) => acc + f.size, 0)) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <label class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add More
            <input type="file" multiple accept="image/*,.jpg,.jpeg,.png,.webp,.bmp,.gif,.svg,.ico,.heic,.heif" class="hidden" @change="(e) => onFilesSelected(Array.from((e.target as HTMLInputElement).files || []))" />
          </label>
          <button type="button" class="text-xs font-semibold text-rose-600 hover:underline px-2 py-1" @click="resetAll">
            Clear All
          </button>
        </div>
      </div>

      <!-- Advanced Format & Settings Card -->
      <div class="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-6">
        <!-- 1. Target Format Selection (6 Formats) -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
            1. Target Output Format
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <button
              type="button"
              class="p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5"
              :class="targetFormat === 'image/webp' ? 'bg-brand-600 text-white border-brand-600 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200'"
              @click="targetFormat = 'image/webp'"
            >
              <span class="text-xs font-bold">WebP</span>
              <span class="text-[10px] opacity-75">Modern Web</span>
            </button>

            <button
              type="button"
              class="p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5"
              :class="targetFormat === 'image/png' ? 'bg-brand-600 text-white border-brand-600 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200'"
              @click="targetFormat = 'image/png'"
            >
              <span class="text-xs font-bold">PNG</span>
              <span class="text-[10px] opacity-75">Lossless</span>
            </button>

            <button
              type="button"
              class="p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5"
              :class="targetFormat === 'image/jpeg' ? 'bg-brand-600 text-white border-brand-600 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200'"
              @click="targetFormat = 'image/jpeg'"
            >
              <span class="text-xs font-bold">JPEG (.jpg)</span>
              <span class="text-[10px] opacity-75">Universal</span>
            </button>

            <button
              type="button"
              class="p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5"
              :class="targetFormat === 'image/avif' ? 'bg-brand-600 text-white border-brand-600 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200'"
              @click="targetFormat = 'image/avif'"
            >
              <span class="text-xs font-bold">AVIF</span>
              <span class="text-[10px] opacity-75">Next-Gen</span>
            </button>

            <button
              type="button"
              class="p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5"
              :class="targetFormat === 'image/bmp' ? 'bg-brand-600 text-white border-brand-600 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200'"
              @click="targetFormat = 'image/bmp'"
            >
              <span class="text-xs font-bold">BMP</span>
              <span class="text-[10px] opacity-75">Bitmap 24b</span>
            </button>

            <button
              type="button"
              class="p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5"
              :class="targetFormat === 'image/x-icon' ? 'bg-brand-600 text-white border-brand-600 shadow-xs' : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200'"
              @click="targetFormat = 'image/x-icon'"
            >
              <span class="text-xs font-bold">ICO</span>
              <span class="text-[10px] opacity-75">Favicon</span>
            </button>
          </div>
        </div>

        <!-- 2. Settings Grid (Quality, Transparency, and Color Filters) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <!-- Quality (if lossy) -->
          <div v-if="getFormatMeta(targetFormat).lossy" class="space-y-1.5">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>Encoding Quality</span>
              <span class="font-mono text-brand-600 dark:text-brand-400 font-extrabold">{{ quality }}%</span>
            </div>
            <input v-model.number="quality" type="range" min="15" max="100" class="w-full accent-brand-600 mt-2" />
            <div class="flex justify-between text-[11px] text-slate-400">
              <span>Compact</span>
              <span>Default (90%)</span>
              <span>Ultra</span>
            </div>
          </div>

          <!-- Favicon Icon Size (if ICO) -->
          <div v-else-if="targetFormat === 'image/x-icon'" class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Favicon Icon Resolution
            </label>
            <select v-model.number="icoSize" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-xs">
              <option :value="16">16 x 16 px (Browser Tab Classic)</option>
              <option :value="32">32 x 32 px (Standard Favicon)</option>
              <option :value="48">48 x 48 px (Desktop Icon)</option>
              <option :value="64">64 x 64 px (Retina Icon)</option>
              <option :value="128">128 x 128 px (High-DPI App Icon)</option>
            </select>
          </div>

          <!-- Lossless info for PNG / BMP -->
          <div v-else class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Compression Mode
            </label>
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              Lossless pixel-perfect encoding (100% original fidelity).
            </div>
          </div>

          <!-- Background Fill Strategy (For Transparent Images) -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Background Fill (for Transparent PNGs)
            </label>
            <div class="flex items-center gap-2">
              <select v-model="bgFillType" class="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-xs">
                <option value="white">White Fill (Recommended)</option>
                <option value="black">Black Fill</option>
                <option value="custom">Custom Color Fill</option>
                <option v-if="targetFormat !== 'image/jpeg' && targetFormat !== 'image/bmp'" value="transparent">Keep Transparent</option>
              </select>
              <input v-if="bgFillType === 'custom'" v-model="customBgColor" type="color" class="w-8 h-8 rounded-lg cursor-pointer p-0 border-0 bg-transparent" />
            </div>
          </div>

          <!-- Color Filters / Effects -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Color Filter / Tone
            </label>
            <select v-model="colorFilter" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-xs">
              <option value="none">Original Colors (Full Color)</option>
              <option value="grayscale">Grayscale (Black & White)</option>
              <option value="sepia">Sepia Tone (Vintage)</option>
              <option value="invert">Invert Colors (Negative)</option>
            </select>
          </div>
        </div>

        <!-- 3. Scaling & Dimensions Controls -->
        <div class="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <label class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Dimension & Scaling Options
            </label>
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                class="px-2.5 py-1 rounded-md font-semibold transition-all"
                :class="scaleMode === 'original' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-white shadow-xs' : 'text-slate-500'"
                @click="scaleMode = 'original'"
              >
                Original Size
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-md font-semibold transition-all"
                :class="scaleMode === 'percent' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-white shadow-xs' : 'text-slate-500'"
                @click="scaleMode = 'percent'"
              >
                Scale %
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-md font-semibold transition-all"
                :class="scaleMode === 'maxDim' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-white shadow-xs' : 'text-slate-500'"
                @click="scaleMode = 'maxDim'"
              >
                Max Clamp
              </button>
            </div>
          </div>

          <!-- Scale % Slider -->
          <div v-if="scaleMode === 'percent'" class="space-y-1.5">
            <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Resize to: <strong class="text-slate-900 dark:text-white">{{ scalePercent }}%</strong> of original size</span>
            </div>
            <input v-model.number="scalePercent" type="range" min="20" max="200" step="5" class="w-full accent-brand-600" />
          </div>

          <!-- Max Dimension Presets -->
          <div v-else-if="scaleMode === 'maxDim'" class="flex flex-wrap gap-2 text-xs">
            <button
              v-for="d in [2560, 1920, 1280, 800]"
              :key="d"
              type="button"
              class="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"
              :class="maxDimValue === d ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300'"
              @click="maxDimValue = d"
            >
              Max {{ d }}px
            </button>
          </div>
        </div>

        <!-- 4. PROMINENT ACTION BUTTON -->
        <button
          type="button"
          :disabled="isProcessing"
          class="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          @click="startConversion"
        >
          <svg v-if="isProcessing" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span v-if="isProcessing">{{ progressStatus || 'Converting Images...' }}</span>
          <span v-else>
            🔄 Convert {{ sourceFiles.length }} Image{{ sourceFiles.length > 1 ? 's' : '' }} to {{ getFormatMeta(targetFormat).label }}
          </span>
        </button>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
        {{ errorMessage }}
      </div>

      <!-- Results Grid (Shown after conversion completes) -->
      <div v-if="convertedResults.length > 0" class="space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
            Converted {{ convertedResults.length }} Image{{ convertedResults.length > 1 ? 's' : '' }} to {{ getFormatMeta(targetFormat).label }}
          </span>
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5"
            @click="downloadAllZip"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download All (ZIP)
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="item in convertedResults"
            :key="item.id"
            class="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs"
          >
            <div class="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-1">
              <img :src="item.previewUrl" :alt="item.targetName" class="w-full h-full object-contain" />
            </div>

            <div>
              <div class="flex items-center justify-between gap-2">
                <p class="font-bold text-slate-900 dark:text-white text-xs truncate">{{ item.targetName }}</p>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
                  {{ item.formatLabel }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                From {{ item.originalName }} ({{ formatBytes(item.origSize) }} → <strong class="text-slate-800 dark:text-slate-200">{{ formatBytes(item.newSize) }}</strong>)
              </p>
            </div>

            <div class="pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                class="w-full py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5"
                @click="downloadSingle(item)"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download {{ item.formatLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
