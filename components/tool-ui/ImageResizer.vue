<script setup lang="ts">
import { ref } from 'vue'
import FileDropzone from '~/components/tools/FileDropzone.vue'
import ResultPanel from '~/components/tools/ResultPanel.vue'
import { useDownload } from '~/composables/useDownload'

const { downloadBlob } = useDownload()

const selectedFile = ref<File | null>(null)
const originalWidth = ref(0)
const originalHeight = ref(0)
const previewDataUrl = ref('')

const resizeMode = ref<'pixels' | 'percentage'>('pixels')
const targetWidth = ref(800)
const targetHeight = ref(600)
const percentage = ref(50)
const lockAspectRatio = ref(true)

const outputFormat = ref<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg')
const quality = ref(85)

const isProcessing = ref(false)
const errorMessage = ref<string | null>(null)
const resizedBlob = ref<Blob | null>(null)
const resizedUrl = ref<string | null>(null)
const resultFilename = ref('resized.jpg')

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

async function onFileSelected(files: File[]) {
  if (files.length === 0) return
  const file = files[0]
  selectedFile.value = file
  resizedBlob.value = null
  resizedUrl.value = null
  errorMessage.value = null

  try {
    const img = await loadImageFromFile(file)
    originalWidth.value = img.naturalWidth || img.width
    originalHeight.value = img.naturalHeight || img.height
    targetWidth.value = originalWidth.value
    targetHeight.value = originalHeight.value
    previewDataUrl.value = img.src
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to open image'
    selectedFile.value = null
  }
}

function onWidthChange() {
  if (lockAspectRatio.value && originalWidth.value > 0) {
    const ratio = originalHeight.value / originalWidth.value
    targetHeight.value = Math.max(1, Math.round(targetWidth.value * ratio))
  }
}

function onHeightChange() {
  if (lockAspectRatio.value && originalHeight.value > 0) {
    const ratio = originalWidth.value / originalHeight.value
    targetWidth.value = Math.max(1, Math.round(targetHeight.value * ratio))
  }
}

function applyPreset(w: number, h: number) {
  resizeMode.value = 'pixels'
  lockAspectRatio.value = false
  targetWidth.value = w
  targetHeight.value = h
}

async function resizeImage() {
  if (!selectedFile.value) return
  isProcessing.value = true
  errorMessage.value = null

  try {
    let finalW = targetWidth.value
    let finalH = targetHeight.value

    if (resizeMode.value === 'percentage') {
      const factor = percentage.value / 100
      finalW = Math.max(1, Math.round(originalWidth.value * factor))
      finalH = Math.max(1, Math.round(originalHeight.value * factor))
    }

    const img = await loadImageFromFile(selectedFile.value)

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, finalW)
    canvas.height = Math.max(1, finalH)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not initialize Canvas 2D context')

    // If JPEG, fill white background to prevent transparent PNGs turning black
    if (outputFormat.value === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, finalW, finalH)
    }

    // High quality downsampling
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, finalW, finalH)

    const qualityFactor = Math.min(1, Math.max(0.1, quality.value / 100))
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b)
        else reject(new Error('Canvas toBlob encoding failed'))
      }, outputFormat.value, qualityFactor)
    })

    if (resizedUrl.value) URL.revokeObjectURL(resizedUrl.value)
    resizedBlob.value = blob
    resizedUrl.value = URL.createObjectURL(blob)

    const ext = outputFormat.value === 'image/png' ? 'png' : outputFormat.value === 'image/webp' ? 'webp' : 'jpg'
    const base = selectedFile.value.name.replace(/\.[^/.]+$/, '')
    resultFilename.value = `${base}_${finalW}x${finalH}.${ext}`
  } catch (err: any) {
    errorMessage.value = `Resizing failed: ${err.message || 'Unknown error'}`
  } finally {
    isProcessing.value = false
  }
}

function downloadResized() {
  if (resizedBlob.value) {
    downloadBlob(resizedBlob.value, resultFilename.value)
  }
}

function resetAll() {
  if (resizedUrl.value) URL.revokeObjectURL(resizedUrl.value)
  selectedFile.value = null
  previewDataUrl.value = ''
  resizedBlob.value = null
  resizedUrl.value = null
  errorMessage.value = null
}
</script>

<template>
  <div class="space-y-6">
    <FileDropzone
      v-if="!selectedFile"
      title="Drop image here to resize"
      subtitle="Resize by pixels or percentage scale with social media presets."
      accept="image/*,.jpg,.jpeg,.png,.webp,.bmp,.gif"
      :multiple="false"
      @files-selected="onFileSelected"
    />

    <div v-else class="space-y-6">
      <div class="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{{ selectedFile.name }}</h3>
          <p class="text-xs text-slate-500">
            Original: <strong class="text-slate-700 dark:text-slate-300">{{ originalWidth }} x {{ originalHeight }} px</strong> • {{ (selectedFile.size / 1024).toFixed(1) }} KB
          </p>
        </div>
        <button type="button" class="text-xs font-semibold text-rose-600 hover:underline" @click="resetAll">
          Change Image
        </button>
      </div>

      <!-- Controls -->
      <div class="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-6">
        <!-- Social Media Presets -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Social Media Quick Presets
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
              @click="applyPreset(1080, 1080)"
            >
              Instagram Square (1080x1080)
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
              @click="applyPreset(1080, 1920)"
            >
              Story / Reel (1080x1920)
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
              @click="applyPreset(1280, 720)"
            >
              YouTube Thumbnail (1280x720)
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
              @click="applyPreset(1500, 500)"
            >
              Twitter Header (1500x500)
            </button>
          </div>
        </div>

        <!-- Mode Toggle (Pixels vs Percentage) -->
        <div class="space-y-4 pt-2 border-t border-slate-200/80 dark:border-slate-800">
          <div class="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              :class="resizeMode === 'pixels' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              @click="resizeMode = 'pixels'"
            >
              By Dimensions (Pixels)
            </button>
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              :class="resizeMode === 'percentage' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              @click="resizeMode = 'percentage'"
            >
              By Percentage (%)
            </button>
          </div>

          <!-- Width / Height in pixels -->
          <div v-if="resizeMode === 'pixels'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="grid grid-cols-2 gap-3 sm:col-span-2">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Width (px)</label>
                <input
                  v-model.number="targetWidth"
                  type="number"
                  min="1"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 font-mono text-sm focus:ring-2 focus:ring-brand-500"
                  @input="onWidthChange"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Height (px)</label>
                <input
                  v-model.number="targetHeight"
                  type="number"
                  min="1"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 font-mono text-sm focus:ring-2 focus:ring-brand-500"
                  @input="onHeightChange"
                />
              </div>
            </div>

            <label class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer sm:col-span-2">
              <input v-model="lockAspectRatio" type="checkbox" class="rounded text-brand-600 focus:ring-brand-500" />
              <span>Maintain Aspect Ratio</span>
            </label>
          </div>

          <!-- Scale by Percentage -->
          <div v-else class="space-y-3">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Scale Ratio</span>
              <span class="font-mono text-brand-600 dark:text-brand-400 font-bold text-sm">{{ percentage }}%</span>
            </div>
            <input
              v-model.number="percentage"
              type="range"
              min="10"
              max="200"
              class="w-full accent-brand-600"
            />
            <p class="text-xs text-slate-500">
              Output will be: <strong class="text-slate-800 dark:text-slate-200">{{ Math.max(1, Math.round(originalWidth * percentage / 100)) }} x {{ Math.max(1, Math.round(originalHeight * percentage / 100)) }} px</strong>
            </p>
          </div>
        </div>

        <!-- Format & Quality -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Output Format</label>
            <select v-model="outputFormat" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-xs">
              <option value="image/jpeg">JPEG (.jpg) - Universal</option>
              <option value="image/png">PNG (.png) - Crisp & Transparent</option>
              <option value="image/webp">WebP (.webp) - Modern & Compact</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Compression Quality ({{ quality }}%)</label>
            <input
              v-model.number="quality"
              type="range"
              min="20"
              max="100"
              class="w-full accent-brand-600 mt-2"
            />
          </div>
        </div>

        <button
          type="button"
          :disabled="isProcessing"
          class="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          @click="resizeImage"
        >
          <svg v-if="isProcessing" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span v-if="isProcessing">Resizing Image...</span>
          <span v-else>Apply Resize & Generate Image</span>
        </button>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
        {{ errorMessage }}
      </div>

      <!-- Result Panel -->
      <ResultPanel
        v-if="resizedBlob"
        title="Resized Image Ready"
        :show-copy="false"
        :show-download="true"
        :original-size="selectedFile.size"
        :result-size="resizedBlob.size"
        :download-filename="resultFilename"
        @download="downloadResized"
        @reset="resetAll"
      >
        <div class="p-4 text-center space-y-3">
          <div class="max-h-72 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 p-2">
            <img :src="resizedUrl || ''" alt="Resized Preview" class="max-h-64 object-contain shadow-xs" />
          </div>
          <p class="text-xs text-slate-500 font-mono">
            {{ resultFilename }}
          </p>
        </div>
      </ResultPanel>
    </div>
  </div>
</template>
