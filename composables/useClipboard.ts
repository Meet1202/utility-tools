import { ref } from 'vue'

export function useClipboard() {
  const copied = ref(false)
  const isSupported = typeof navigator !== 'undefined' && 'clipboard' in navigator

  async function copy(text: string): Promise<boolean> {
    if (!text) return false
    try {
      if (isSupported && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers / iframe contexts
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        textarea.style.top = '-9999px'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
      return true
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      return false
    }
  }

  return {
    copy,
    copied,
    isSupported
  }
}
