import QRCode from 'qrcode'

export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H'
export type DotStyle = 'square' | 'rounded' | 'dots'
export type CornerStyle = 'square' | 'rounded' | 'circle'

export interface QrRenderOptions {
  text: string
  ecLevel?: QrErrorCorrection
  fgColor?: string
  bgColor?: string
  margin?: number
  dotStyle?: DotStyle
  cornerStyle?: CornerStyle
  logoUrl?: string | null
}

/**
 * Creates an ISO/IEC 18004 compliant QR Code model using the standard qrcode engine.
 */
export function getQrModel(text: string, ecLevel: QrErrorCorrection = 'M'): QRCode.QRCode {
  const content = text && text.trim().length > 0 ? text : 'https://'
  return QRCode.create(content, {
    errorCorrectionLevel: ecLevel
  })
}

/**
 * Checks if a module coordinate belongs to one of the three 7x7 finder patterns.
 */
export function isFinderModule(row: number, col: number, size: number): boolean {
  // Top-Left finder: [0..6, 0..6]
  if (row < 7 && col < 7) return true
  // Top-Right finder: [0..6, (size-7)..size-1]
  if (row < 7 && col >= size - 7) return true
  // Bottom-Left finder: [(size-7)..size-1, 0..6]
  if (row >= size - 7 && col < 7) return true
  return false
}

/**
 * Checks if a module coordinate is within the quiet separator around finders
 */
export function isFinderSeparator(row: number, col: number, size: number): boolean {
  if (row <= 7 && col <= 7) return true
  if (row <= 7 && col >= size - 8) return true
  if (row >= size - 8 && col <= 7) return true
  return false
}

/**
 * Checks if a module falls within the center area reserved for a logo
 */
export function isLogoModule(row: number, col: number, size: number, hasLogo: boolean): boolean {
  if (!hasLogo) return false
  const center = Math.floor(size / 2)
  // Reserve roughly 20% of the center width
  const radius = Math.floor(size * 0.11)
  return Math.abs(row - center) <= radius && Math.abs(col - center) <= radius
}

/**
 * Generates clean, 100% mobile-scannable SVG markup.
 */
export function generateQrSvg(options: QrRenderOptions): string {
  const {
    text,
    ecLevel = options.logoUrl ? 'H' : 'M',
    fgColor = '#0f172a',
    bgColor = '#ffffff',
    margin = 4,
    dotStyle = 'square',
    cornerStyle = 'square',
    logoUrl = null
  } = options

  const qr = getQrModel(text, ecLevel)
  const size = qr.modules.size
  const totalSize = size + margin * 2

  let paths = ''

  // 1. Render data modules (excluding finder patterns and logo area)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFinderModule(r, c, size)) continue
      if (isLogoModule(r, c, size, !!logoUrl)) continue

      const isDark = qr.modules.get(r, c)
      if (!isDark) continue

      const x = c + margin
      const y = r + margin

      if (dotStyle === 'dots') {
        paths += `<circle cx="${(x + 0.5).toFixed(2)}" cy="${(y + 0.5).toFixed(2)}" r="0.48" fill="${fgColor}"/>`
      } else if (dotStyle === 'rounded') {
        paths += `<rect x="${x}" y="${y}" width="1" height="1" rx="0.3" fill="${fgColor}"/>`
      } else {
        paths += `<rect x="${x}" y="${y}" width="1.01" height="1.01" fill="${fgColor}"/>`
      }
    }
  }

  // 2. Render 3 Finder Patterns
  function renderFinderPattern(startX: number, startY: number): string {
    const x = startX + margin
    const y = startY + margin

    let outerRx = '0'
    let innerRx = '0'

    if (cornerStyle === 'rounded') {
      outerRx = '1.2'
      innerRx = '0.6'
    } else if (cornerStyle === 'circle') {
      outerRx = '2'
      innerRx = '1'
    }

    let finder = ''
    // Outer 7x7 dark box
    finder += `<rect x="${x}" y="${y}" width="7" height="7" rx="${outerRx}" fill="${fgColor}"/>`
    // Inner 5x5 light box
    finder += `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="${outerRx === '0' ? '0' : '0.8'}" fill="${bgColor}"/>`
    // Center 3x3 dark box
    finder += `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="${innerRx}" fill="${fgColor}"/>`
    return finder
  }

  paths += renderFinderPattern(0, 0)
  paths += renderFinderPattern(size - 7, 0)
  paths += renderFinderPattern(0, size - 7)

  // 3. Center Logo (if present)
  let logoMarkup = ''
  if (logoUrl) {
    const center = Math.floor(size / 2) + margin
    const logoBox = size * 0.22
    const logoX = center - logoBox / 2
    const logoY = center - logoBox / 2
    const shieldPadding = 0.4
    const shieldX = logoX - shieldPadding
    const shieldY = logoY - shieldPadding
    const shieldSize = logoBox + shieldPadding * 2

    logoMarkup = `
      <rect x="${shieldX.toFixed(2)}" y="${shieldY.toFixed(2)}" width="${shieldSize.toFixed(2)}" height="${shieldSize.toFixed(2)}" rx="1.5" fill="${bgColor}" />
      <image href="${logoUrl}" x="${logoX.toFixed(2)}" y="${logoY.toFixed(2)}" width="${logoBox.toFixed(2)}" height="${logoBox.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />
    `
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges" width="100%" height="100%">
    <rect width="${totalSize}" height="${totalSize}" fill="${bgColor}"/>
    ${paths}
    ${logoMarkup}
  </svg>`
}
