<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  generateQrSvg,
  type QrErrorCorrection,
  type DotStyle,
  type CornerStyle
} from '~/utils/qrEngine'
import { useDownload } from '~/composables/useDownload'

const { downloadBlob } = useDownload()

// Active QR type tab
type QrType = 'url' | 'text' | 'upi' | 'wifi' | 'vcard' | 'whatsapp' | 'email' | 'phone' | 'sms' | 'geo'
const activeType = ref<QrType>('url')

// Fields per type
const urlInput = ref('https://github.com')
const textInput = ref('Hello, World!')

// UPI
const upiVpa = ref('merchant@upi')
const upiName = ref('Merchant Name')
const upiAmount = ref('')
const upiNote = ref('Payment')

// Wi-Fi
const wifiSsid = ref('')
const wifiPassword = ref('')
const wifiEncryption = ref<'WPA' | 'WEP' | 'nopass'>('WPA')
const wifiHidden = ref(false)

// vCard
const vcardFirst = ref('')
const vcardLast = ref('')
const vcardPhone = ref('')
const vcardEmail = ref('')
const vcardOrg = ref('')
const vcardUrl = ref('')

// WhatsApp
const waPhone = ref('')
const waMessage = ref('')

// Email
const emailTo = ref('')
const emailSubject = ref('')
const emailBody = ref('')

// Phone & SMS
const phoneInput = ref('')
const smsPhone = ref('')
const smsMessage = ref('')

// Location
const geoLat = ref('')
const geoLng = ref('')

// Styling options (defaults optimized for instant smartphone scanner detection)
const fgColor = ref('#0f172a')
const bgColor = ref('#ffffff')
const dotStyle = ref<DotStyle>('square')
const cornerStyle = ref<CornerStyle>('square')
const marginSize = ref(4) // 4 modules ISO quiet zone
const errorCorrection = ref<QrErrorCorrection>('M')
const logoDataUrl = ref<string | null>(null)
const copySuccess = ref(false)

// Computed payload string
const qrPayload = computed(() => {
  switch (activeType.value) {
    case 'url': {
      let u = urlInput.value.trim()
      if (u && !u.startsWith('http://') && !u.startsWith('https://')) {
        u = 'https://' + u
      }
      return u || 'https://'
    }
    case 'text':
      return textInput.value || ' '
    case 'upi': {
      // NPCI spec: keep @ literal in VPA for 100% app compatibility
      const pa = upiVpa.value.trim().replace(/\s+/g, '')
      const pn = encodeURIComponent(upiName.value.trim() || 'Merchant')
      let uri = `upi://pay?pa=${pa}&pn=${pn}&cu=INR`
      if (upiAmount.value.trim()) uri += `&am=${encodeURIComponent(upiAmount.value.trim())}`
      if (upiNote.value.trim()) uri += `&tn=${encodeURIComponent(upiNote.value.trim())}`
      return uri
    }
    case 'wifi': {
      return `WIFI:T:${wifiEncryption.value};S:${wifiSsid.value};P:${wifiPassword.value};H:${wifiHidden.value};;`
    }
    case 'vcard': {
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${vcardLast.value};${vcardFirst.value}`,
        `FN:${vcardFirst.value} ${vcardLast.value}`.trim(),
        vcardOrg.value ? `ORG:${vcardOrg.value}` : '',
        vcardPhone.value ? `TEL:${vcardPhone.value}` : '',
        vcardEmail.value ? `EMAIL:${vcardEmail.value}` : '',
        vcardUrl.value ? `URL:${vcardUrl.value}` : '',
        'END:VCARD'
      ].filter(Boolean).join('\n')
    }
    case 'whatsapp': {
      const cleanPhone = waPhone.value.replace(/[^0-9]/g, '')
      const msg = encodeURIComponent(waMessage.value)
      return `https://wa.me/${cleanPhone}?text=${msg}`
    }
    case 'email': {
      return `mailto:${emailTo.value}?subject=${encodeURIComponent(emailSubject.value)}&body=${encodeURIComponent(emailBody.value)}`
    }
    case 'phone':
      return `tel:${phoneInput.value.trim()}`
    case 'sms':
      return `smsto:${smsPhone.value.trim()}:${smsMessage.value}`
    case 'geo':
      return `geo:${geoLat.value.trim()},${geoLng.value.trim()}`
    default:
      return 'https://'
  }
})

// Auto-upgrade error correction to H when logo is uploaded for max redundancy
watch(logoDataUrl, (hasLogo) => {
  if (hasLogo) {
    errorCorrection.value = 'H'
  }
})

// Relative luminance & contrast ratio calculation
const contrastRatio = computed(() => {
  function getLuminance(hex: string): number {
    const c = hex.replace('#', '')
    if (c.length < 6) return 1
    const r = parseInt(c.substring(0, 2), 16) / 255
    const g = parseInt(c.substring(2, 4), 16) / 255
    const b = parseInt(c.substring(4, 6), 16) / 255
    const sRGB = [r, g, b].map(val => val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4))
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
  }

  try {
    const l1 = getLuminance(fgColor.value)
    const l2 = getLuminance(bgColor.value)
    const bright = Math.max(l1, l2)
    const dark = Math.min(l1, l2)
    return (bright + 0.05) / (dark + 0.05)
  } catch {
    return 21
  }
})

// Generate SVG markup via the ISO-compliant qrcode engine
const svgMarkup = computed(() => {
  try {
    return generateQrSvg({
      text: qrPayload.value,
      ecLevel: logoDataUrl.value ? 'H' : errorCorrection.value,
      fgColor: fgColor.value,
      bgColor: bgColor.value,
      margin: Number(marginSize.value) || 4,
      dotStyle: dotStyle.value,
      cornerStyle: cornerStyle.value,
      logoUrl: logoDataUrl.value
    })
  } catch (e) {
    console.error('QR generation error:', e)
    return ''
  }
})

// File upload for center logo
function onLogoUpload(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      logoDataUrl.value = event.target?.result as string
    }
    reader.readAsDataURL(file)
    input.value = ''
  }
}

function removeLogo() {
  logoDataUrl.value = null
}

// Download vector SVG
function downloadSvg() {
  const blob = new Blob([svgMarkup.value], { type: 'image/svg+xml;charset=utf-8' })
  downloadBlob(blob, 'qrcode.svg')
}

// Download high-resolution PNG (1024x1024)
function downloadPng() {
  const svgBlob = new Blob([svgMarkup.value], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  const img = new Image()

  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = bgColor.value
      ctx.fillRect(0, 0, 1024, 1024)
      ctx.drawImage(img, 0, 0, 1024, 1024)
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, 'qrcode.png')
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
  }
  img.src = url
}

// Copy PNG image to clipboard
async function copyImage() {
  try {
    const svgBlob = new Blob([svgMarkup.value], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 1024
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = bgColor.value
        ctx.fillRect(0, 0, 1024, 1024)
        ctx.drawImage(img, 0, 0, 1024, 1024)
        canvas.toBlob(async (blob) => {
          if (blob && navigator.clipboard && (window as any).ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ])
            copySuccess.value = true
            setTimeout(() => { copySuccess.value = false }, 2500)
          }
          URL.revokeObjectURL(url)
        }, 'image/png')
      }
    }
    img.src = url
  } catch (err) {
    console.error('Clipboard write failed:', err)
  }
}

function resetForm() {
  activeType.value = 'url'
  urlInput.value = 'https://github.com'
  fgColor.value = '#0f172a'
  bgColor.value = '#ffffff'
  dotStyle.value = 'square'
  cornerStyle.value = 'square'
  marginSize.value = 4
  errorCorrection.value = 'M'
  logoDataUrl.value = null
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- LEFT COLUMN: Types, Form Inputs & Styling (7 Cols) -->
    <div class="lg:col-span-7 space-y-6">
      <!-- QR Type Navigation Tabs -->
      <div class="p-1.5 rounded-2xl glass-panel flex flex-wrap gap-1">
        <button
          v-for="t in [
            { id: 'url', label: 'URL / Link' },
            { id: 'text', label: 'Text' },
            { id: 'upi', label: 'UPI Pay (India)' },
            { id: 'wifi', label: 'Wi-Fi' },
            { id: 'vcard', label: 'vCard' },
            { id: 'whatsapp', label: 'WhatsApp' },
            { id: 'email', label: 'Email' },
            { id: 'phone', label: 'Phone' },
            { id: 'sms', label: 'SMS' }
          ]"
          :key="t.id"
          type="button"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          :class="[
            activeType === t.id
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          ]"
          @click="activeType = t.id as QrType"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Input Forms -->
      <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-4">
        <!-- URL Form -->
        <div v-if="activeType === 'url'" class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Target Website URL
          </label>
          <input
            v-model="urlInput"
            type="url"
            placeholder="https://yourwebsite.com"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <!-- Plain Text Form -->
        <div v-else-if="activeType === 'text'" class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Plain Text Message
          </label>
          <textarea
            v-model="textInput"
            rows="4"
            placeholder="Type any text or code snippet..."
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          ></textarea>
        </div>

        <!-- UPI Payment Form (India Flagship Feature) -->
        <div v-else-if="activeType === 'upi'" class="space-y-3">
          <div class="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-xs text-orange-800 dark:text-orange-300">
            <strong>UPI Intent QR:</strong> Scannable directly by Google Pay, PhonePe, Paytm, and BHIM to receive payments instantly.
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Payee UPI ID (VPA) *
              </label>
              <input
                v-model="upiVpa"
                type="text"
                placeholder="name@okaxis or 9876543210@paytm"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Payee Name *
              </label>
              <input
                v-model="upiName"
                type="text"
                placeholder="John Stores"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Amount (INR ₹, optional)
              </label>
              <input
                v-model="upiAmount"
                type="number"
                placeholder="e.g. 500"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Note / Description (optional)
              </label>
              <input
                v-model="upiNote"
                type="text"
                placeholder="Order payment"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        <!-- Wi-Fi Form -->
        <div v-else-if="activeType === 'wifi'" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Network Name (SSID)
            </label>
            <input
              v-model="wifiSsid"
              type="text"
              placeholder="Home_WiFi"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                v-model="wifiPassword"
                type="text"
                placeholder="WiFi password"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Security Encryption
              </label>
              <select
                v-model="wifiEncryption"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
              >
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open Network)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- WhatsApp Form -->
        <div v-else-if="activeType === 'whatsapp'" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Phone Number (with Country Code)
            </label>
            <input
              v-model="waPhone"
              type="tel"
              placeholder="+919876543210"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Prefilled Message
            </label>
            <textarea
              v-model="waMessage"
              rows="3"
              placeholder="Hi, I am inquiring about..."
              class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
            ></textarea>
          </div>
        </div>

        <!-- vCard Form -->
        <div v-else-if="activeType === 'vcard'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">First Name</label>
            <input v-model="vcardFirst" type="text" placeholder="John" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Last Name</label>
            <input v-model="vcardLast" type="text" placeholder="Doe" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Phone</label>
            <input v-model="vcardPhone" type="tel" placeholder="+1234567890" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Email</label>
            <input v-model="vcardEmail" type="email" placeholder="john@example.com" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-sm" />
          </div>
        </div>

        <!-- Email / Phone / SMS Fallbacks -->
        <div v-else class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Target Contact</label>
            <input
              v-if="activeType === 'email'"
              v-model="emailTo"
              type="email"
              placeholder="contact@example.com"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-sm"
            />
            <input
              v-else-if="activeType === 'phone'"
              v-model="phoneInput"
              type="tel"
              placeholder="+1234567890"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-sm"
            />
            <input
              v-else-if="activeType === 'sms'"
              v-model="smsPhone"
              type="tel"
              placeholder="Phone number"
              class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900 text-sm"
            />
          </div>
        </div>
      </div>

      <!-- CUSTOMIZATION & STYLING CONTROLS -->
      <div class="p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-5">
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <span class="w-2 h-4 bg-brand-500 rounded-full inline-block"></span>
          Design & Customization
        </h3>

        <!-- Colors -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Foreground Color</label>
            <div class="flex items-center gap-2">
              <input v-model="fgColor" type="color" class="w-9 h-9 rounded-lg border-0 cursor-pointer p-0 bg-transparent" />
              <input v-model="fgColor" type="text" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase bg-white/50 dark:bg-slate-900" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Background Color</label>
            <div class="flex items-center gap-2">
              <input v-model="bgColor" type="color" class="w-9 h-9 rounded-lg border-0 cursor-pointer p-0 bg-transparent" />
              <input v-model="bgColor" type="text" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase bg-white/50 dark:bg-slate-900" />
            </div>
          </div>
        </div>

        <!-- Low-contrast warning -->
        <div
          v-if="contrastRatio < 3"
          class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2"
        >
          <svg class="w-4 h-4 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Low contrast ratio ({{ contrastRatio.toFixed(1) }}:1). May cause camera scanning issues. Keep foreground dark and background bright.</span>
        </div>

        <!-- Dot Style, Corner Style & Margin -->
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Dot Style</label>
            <select
              v-model="dotStyle"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900 text-xs"
            >
              <option value="square">Square (Crisp)</option>
              <option value="rounded">Smooth Rounded</option>
              <option value="dots">Dots / Circles</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Corner Eye Style</label>
            <select
              v-model="cornerStyle"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900 text-xs"
            >
              <option value="square">Standard Square</option>
              <option value="rounded">Smooth Rounded</option>
              <option value="circle">Circular Eye</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Quiet Margin</label>
            <select
              v-model.number="marginSize"
              class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900 text-xs"
            >
              <option :value="2">Compact (2)</option>
              <option :value="4">Standard (4 - Recommended)</option>
              <option :value="6">Wide (6)</option>
            </select>
          </div>
        </div>

        <!-- Center Logo Upload -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Center Logo (Auto-switches to Level H Error Correction)
          </label>
          <div v-if="!logoDataUrl" class="flex items-center gap-3">
            <label class="relative overflow-hidden px-3.5 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300 inline-flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload PNG / SVG Logo
              <input type="file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" @change="onLogoUpload" />
            </label>
          </div>
          <div v-else class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg p-1 bg-white border border-slate-200 flex items-center justify-center">
              <img :src="logoDataUrl" alt="Center Logo" class="max-w-full max-h-full object-contain" />
            </div>
            <button
              type="button"
              class="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              @click="removeLogo"
            >
              Remove Logo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT COLUMN: Live Sticky Preview & Download Actions (5 Cols) -->
    <div class="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
      <div class="p-6 rounded-3xl glass-panel text-center border border-slate-200 dark:border-slate-800 shadow-xl">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          Live Interactive Preview
        </h3>

        <!-- QR Code Container -->
        <div class="w-64 h-64 mx-auto p-4 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center transition-all overflow-hidden">
          <div class="w-full h-full flex items-center justify-center" v-html="svgMarkup"></div>
        </div>

        <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
          ISO/IEC 18004 compliant • Scannable on all iOS Camera, Google Lens & Android devices
        </p>

        <!-- Actions -->
        <div class="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            class="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            @click="downloadPng"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download High-Res PNG (1024px)
          </button>

          <div class="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              class="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              @click="downloadSvg"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Vector SVG
            </button>

            <button
              type="button"
              class="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              :class="{ '!border-emerald-500 !text-emerald-600': copySuccess }"
              @click="copyImage"
            >
              <svg v-if="!copySuccess" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <svg v-else class="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{{ copySuccess ? 'Copied!' : 'Copy Image' }}</span>
            </button>
          </div>

          <button
            type="button"
            class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-1"
            @click="resetForm"
          >
            Reset all settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
