<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useToolRegistry } from '~/composables/useToolRegistry'
import ToolLayout from '~/components/tools/ToolLayout.vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { getTool } = useToolRegistry()

const tool = computed(() => getTool(slug.value))

if (!tool.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Tool "${slug.value}" not found`
  })
}

// Dynamic component loader for each tool
const currentComponent = computed(() => {
  switch (slug.value) {
    case 'merge-pdf':
      return defineAsyncComponent(() => import('~/components/tool-ui/PdfMerge.vue'))
    case 'split-pdf':
      return defineAsyncComponent(() => import('~/components/tool-ui/PdfSplit.vue'))
    case 'compress-pdf':
      return defineAsyncComponent(() => import('~/components/tool-ui/PdfCompress.vue'))
    case 'image-to-pdf':
      return defineAsyncComponent(() => import('~/components/tool-ui/ImageToPdf.vue'))
    case 'pdf-to-image':
      return defineAsyncComponent(() => import('~/components/tool-ui/PdfToImage.vue'))
    case 'image-compressor':
      return defineAsyncComponent(() => import('~/components/tool-ui/ImageCompressor.vue'))
    case 'image-resizer':
      return defineAsyncComponent(() => import('~/components/tool-ui/ImageResizer.vue'))
    case 'image-converter':
      return defineAsyncComponent(() => import('~/components/tool-ui/ImageConverter.vue'))
    case 'qr-generator':
      return defineAsyncComponent(() => import('~/components/tool-ui/QrGenerator.vue'))
    case 'json-formatter':
      return defineAsyncComponent(() => import('~/components/tool-ui/JsonFormatter.vue'))
    case 'base64-converter':
      return defineAsyncComponent(() => import('~/components/tool-ui/Base64Converter.vue'))
    case 'url-encoder-decoder':
      return defineAsyncComponent(() => import('~/components/tool-ui/UrlEncoderDecoder.vue'))
    case 'jwt-decoder':
      return defineAsyncComponent(() => import('~/components/tool-ui/JwtDecoder.vue'))
    case 'uuid-generator':
      return defineAsyncComponent(() => import('~/components/tool-ui/UuidGenerator.vue'))
    case 'word-counter':
      return defineAsyncComponent(() => import('~/components/tool-ui/WordCounter.vue'))
    case 'case-converter':
      return defineAsyncComponent(() => import('~/components/tool-ui/CaseConverter.vue'))
    case 'password-generator':
      return defineAsyncComponent(() => import('~/components/tool-ui/PasswordGenerator.vue'))
    case 'emi-calculator':
      return defineAsyncComponent(() => import('~/components/tool-ui/EmiCalculator.vue'))
    case 'gst-calculator':
      return defineAsyncComponent(() => import('~/components/tool-ui/GstCalculator.vue'))
    case 'percentage-calculator':
      return defineAsyncComponent(() => import('~/components/tool-ui/PercentageCalculator.vue'))
    default:
      return null
  }
})
</script>

<template>
  <ToolLayout v-if="tool" :tool="tool">
    <component :is="currentComponent" v-if="currentComponent" />
    <div v-else class="p-8 text-center glass-panel rounded-2xl">
      <p class="text-slate-500">Component coming soon in next phase.</p>
    </div>
  </ToolLayout>
</template>
