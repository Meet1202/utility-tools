<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    accept?: string
    multiple?: boolean
    maxSizeMb?: number
    title?: string
    subtitle?: string
    icon?: string
  }>(),
  {
    accept: '*/*',
    multiple: false,
    maxSizeMb: 50,
    title: 'Drop your files here, or click to browse',
    subtitle: 'Runs 100% locally in your browser. Max 50 MB.',
    icon: 'UploadCloud'
  }
)

const emit = defineEmits<{
  (e: 'files-selected', files: File[]): void
  (e: 'error', message: string): void
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const errorMsg = ref<string | null>(null)
const isAndroid = ref(false)

onMounted(() => {
  if (typeof navigator !== 'undefined') {
    isAndroid.value = /android/i.test(navigator.userAgent)
  }
})

// Normalize accept attribute for desktop browsers:
const normalizedAccept = computed(() => {
  if (!props.accept || props.accept === '*/*') return undefined
  
  const tokens = props.accept.split(',').map(s => s.trim()).filter(Boolean)
  
  const extToMime: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.csv': 'text/csv'
  }

  const mimeTypes = new Set<string>()
  for (const token of tokens) {
    if (token.includes('/')) {
      mimeTypes.add(token)
    } else if (extToMime[token.toLowerCase()]) {
      mimeTypes.add(extToMime[token.toLowerCase()])
    }
  }

  if (mimeTypes.size > 0) {
    if (Array.from(mimeTypes).some(m => m.startsWith('image/')) && mimeTypes.has('image/*')) {
      return 'image/*'
    }
    return Array.from(mimeTypes).join(',')
  }

  return props.accept
})

// CRITICAL FOR ANDROID COMPATIBILITY:
// On Android, passing ANY accept filter (such as "application/pdf" or "image/*") often causes
// DocumentsUI (Android's system file picker) or third-party intent handlers to crash with an
// unhandled exception in the OS ActivityManager. When DocumentsUI crashes, Android kills the calling
// browser app immediately!
// By omitting the accept attribute on Android devices, Android opens the safe system file picker cleanly.
// File format safety is enforced via JavaScript validation in checkFileAccepted().
const effectiveAccept = computed(() => {
  if (isAndroid.value) {
    return undefined
  }
  return normalizedAccept.value
})

function checkFileAccepted(file: File, acceptStr: string): boolean {
  if (!acceptStr || acceptStr === '*/*') return true
  const tokens = acceptStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  const fileName = file.name.toLowerCase()
  const fileType = (file.type || '').toLowerCase()

  return tokens.some(token => {
    if (token === '*/*') return true
    if (token.startsWith('.')) {
      return fileName.endsWith(token)
    }
    if (token.endsWith('/*')) {
      const baseType = token.slice(0, -2)
      return fileType.startsWith(baseType)
    }
    if (token === 'application/pdf') {
      return fileType === 'application/pdf' || fileName.endsWith('.pdf')
    }
    return fileType === token || fileName.endsWith(`.${token}`)
  })
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function validateAndEmit(files: FileList | File[]) {
  errorMsg.value = null
  const validFiles: File[] = []
  const maxBytes = props.maxSizeMb * 1024 * 1024

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    if (file.size > maxBytes) {
      errorMsg.value = `File "${file.name}" exceeds the maximum recommended size of ${props.maxSizeMb} MB.`
      emit('error', errorMsg.value)
      continue
    }

    if (props.accept && props.accept !== '*/*') {
      if (!checkFileAccepted(file, props.accept)) {
        errorMsg.value = `File "${file.name}" is not a supported file format.`
        emit('error', errorMsg.value)
        continue
      }
    }

    validFiles.push(file)
    if (!props.multiple) break
  }

  if (validFiles.length > 0) {
    emit('files-selected', validFiles)
  }
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target && target.files && target.files.length > 0) {
    const fileArray = Array.from(target.files)
    validateAndEmit(fileArray)
    // Defer resetting input value to avoid interfering with Android's active file stream
    setTimeout(() => {
      if (target) {
        target.value = ''
      }
    }, 300)
  }
}

function openFilePicker() {
  fileInput.value?.click()
}

defineExpose({
  openFilePicker
})
</script>

<template>
  <div class="w-full">
    <div
      class="relative block border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 select-none overflow-hidden"
      style="touch-action: manipulation;"
      :class="[
        isDragging
          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 scale-[1.01]'
          : 'border-slate-300 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/50 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
      ]"
    >
      <!--
        CRITICAL FOR MOBILE / ANDROID COMPATIBILITY:
        The native <input type="file"> is positioned as an invisible overlay (absolute inset-0)
        covering 100% of the dropzone with opacity: 0 and normal pointer-events.
        
        Why this solves Android browser crash:
        1. On Android Chrome, wrapping an <input type="file"> inside a <label for="..."> or using
           position:fixed 1x1 with pointer-events:none triggers an indirect/synthetic activation.
           DocumentsUI / Chrome's SelectFileDialogImpl fails to compute touch coordinates or encounters
           invalid bounds, causing Android Chrome to terminate / crash.
        2. With an overlay input, the user's finger taps DIRECTLY on the native <input type="file">
           with authentic touch coordinates and full geometry (e.g. 400x160px).
        3. No double click bubbling or synthetic event dispatch.
      -->
      <input
        ref="fileInput"
        type="file"
        :accept="effectiveAccept"
        :multiple="multiple"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        style="touch-action: manipulation;"
        tabindex="0"
        :aria-label="title"
        @change="onFileChange"
        @dragover="isDragging = true"
        @dragleave="isDragging = false"
        @drop="isDragging = false"
      />

      <!-- Visual Content (under the transparent input overlay) -->
      <div class="flex flex-col items-center justify-center pointer-events-none">
        <div
          class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-300"
          :class="isDragging ? 'bg-brand-500 text-white scale-110' : 'bg-brand-100 text-brand-600 dark:bg-brand-950/70 dark:text-brand-400'"
        >
          <svg class="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
            <path d="M12 12v9"/>
            <path d="m16 16-4-4-4 4"/>
          </svg>
        </div>

        <p class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
          <span class="sm:hidden">Tap to choose files</span>
          <span class="hidden sm:inline">{{ isDragging ? 'Drop files right here!' : title }}</span>
        </p>

        <p class="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          {{ subtitle }}
        </p>

        <div class="mt-3 sm:mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] sm:text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <span>{{ !accept || accept === '*/*' ? 'All formats' : accept }}</span>
          <span>•</span>
          <span>Max {{ maxSizeMb }}MB</span>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div
      v-if="errorMsg"
      class="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ errorMsg }}</span>
      </div>
      <button
        type="button"
        class="text-rose-600 hover:text-rose-800 dark:hover:text-rose-200 font-semibold text-xs ml-2"
        @click="errorMsg = null"
      >
        Dismiss
      </button>
    </div>
  </div>
</template>
