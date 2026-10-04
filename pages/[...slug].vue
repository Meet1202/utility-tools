<script setup lang="ts">
import NotFoundView from '~/components/common/NotFoundView.vue'

const route = useRoute()
const event = useRequestEvent()

if (event) {
  setResponseStatus(event, 404, 'Page Not Found')
}

useSeoMeta({
  title: '404 - Page Not Found | ToolBox',
  description: 'The requested page or tool does not exist. Browse our collection of 20+ free, in-browser online utilities.',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <NotFoundView :error-path="route.path" />
</template>
