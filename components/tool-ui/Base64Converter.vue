<script setup lang="ts">
import { ref, computed } from 'vue'
import { encodeBase64, decodeBase64 } from '~/utils/dev'
import { useDownload } from '~/composables/useDownload'
import FileDropzone from '~/components/tools/FileDropzone.vue'
import ResultPanel from '~/components/tools/ResultPanel.vue'

const { downloadText, downloadBlob } = useDownload()

type TabMode = 'text' | 'file'
const activeTab = ref<TabMode>('text')
const isEncoding = ref(true)
const urlSafe = ref(false)

// Text Mode
const textInput = ref('Hello, World! 🚀 ToolBox is 100% private.')
const textOutput = ref('')
const textError = ref<string | null>(null)

// File Mode
const selectedFile = ref<File | null>(null)
const fileBase64 = ref('')
const fileDataUri = ref('')
const isProcessingFile = ref(false)

function convertText() {
  textError.value = null
  if (!textInput.value) {
    textOutput.value = ''
    return
  }

  try {
    if (isEncoding.value) {
      textOutput.value = encodeBase64(textInput.value, urlSafe.value)
    } else {
      textOutput.value = decodeBase64(textInput.value, urlSafe.value)
    }
  } catch (err: any) {
    textError.value = 'Failed to decode Base64. Please ensure the string is valid Base64.'
    textOutput.value = ''
  }
}

function onFileSelected(files: File[]) {
  if (files.length === 0) return
  const file = files[0]
  selectedFile.value = file
  isProcessingFile.value = true

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUri = e.target?.result as string
    fileDataUri.value = dataUri
    // Extract raw base64 part
    const parts = dataUri.split(',')
    fileBase64.value = parts.length > 1 ? parts[1] : parts[0]
    isProcessingFile.value = false
  }
  reader.readAsDataURL(file)
}

function downloadFileBase64() {
  if (fileBase64.value) {
    downloadText(fileBase64.value, `${selectedFile.value?.name || 'file'}.base64.txt`)
  }
}

function resetAll() {
  textInput.value = ''
  textOutput.value = ''
  textError.value = null
  selectedFile.value = null
  fileBase64.value = ''
  fileDataUri.value = ''
}

// Convert on mount
onMounted(() => {
  convertText()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Tab Switcher -->
    <div class="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          :class="activeTab === 'text' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
          @click="activeTab = 'text'"
        >
          Text Mode
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          :class="activeTab === 'file' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'"
          @click="activeTab = 'file'"
        >
          File Mode (Images, PDFs, etc.)
        </button>
      </div>

      <!-- Action Mode (Encode / Decode) -->
      <div v-if="activeTab === 'text'" class="flex items-center gap-3">
        <div class="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            :class="isEncoding ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs' : 'text-slate-500'"
            @click="isEncoding = true; convertText()"
          >
            Encode
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            :class="!isEncoding ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs' : 'text-slate-500'"
            @click="isEncoding = false; convertText()"
          >
            Decode
          </button>
        </div>

        <label class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            v-model="urlSafe"
            type="checkbox"
            class="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            @change="convertText"
          />
          <span>URL Safe (- and _)</span>
        </label>
      </div>
    </div>

    <!-- TEXT MODE -->
    <div v-if="activeTab === 'text'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-1">
          {{ isEncoding ? 'Input Plain Text (UTF-8)' : 'Input Base64 String' }}
        </label>
        <textarea
          v-model="textInput"
          rows="12"
          :placeholder="isEncoding ? 'Enter text to encode...' : 'Paste Base64 string to decode...'"
          class="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
          @input="convertText"
        ></textarea>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-1">
          {{ isEncoding ? 'Base64 Encoded Result' : 'Decoded Plain Text' }}
        </label>
        <ResultPanel
          :title="isEncoding ? 'Base64 Result' : 'Decoded Plain Text'"
          :result-text="textOutput"
          :error="textError"
          @reset="resetAll"
        />
      </div>
    </div>

    <!-- FILE MODE -->
    <div v-else class="space-y-6">
      <FileDropzone
        title="Drop any file to convert into Base64"
        subtitle="Images, icons, documents, or audio up to 50 MB"
        accept="*/*"
        @files-selected="onFileSelected"
      />

      <div v-if="fileBase64" class="space-y-4">
        <!-- File details -->
        <div class="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-800 dark:text-slate-200">{{ selectedFile?.name }}</span>
          <span class="text-slate-500">{{ fileBase64.length.toLocaleString() }} Base64 characters</span>
        </div>

        <ResultPanel
          title="Raw Base64 Output"
          :result-text="fileBase64"
          :show-download="true"
          download-filename="file_base64.txt"
          @download="downloadFileBase64"
          @reset="resetAll"
        />

        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Data URI (Embed in HTML/CSS)
          </label>
          <div class="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs break-all max-h-32 overflow-y-auto">
            {{ fileDataUri }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
