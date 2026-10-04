/**
 * Helpers for image format conversion, custom encoders (BMP, ICO),
 * and color filter processing.
 */

export type TargetImageFormat = 'image/webp' | 'image/png' | 'image/jpeg' | 'image/avif' | 'image/bmp' | 'image/x-icon'
export type ColorFilter = 'none' | 'grayscale' | 'sepia' | 'invert'

export interface ImageConvertOptions {
  format: TargetImageFormat
  quality: number // 10 to 100
  backgroundColor: string // e.g. '#ffffff'
  filter: ColorFilter
  scaleMode: 'original' | 'percent' | 'maxDim' | 'custom'
  scalePercent: number // e.g. 50
  maxDim: number // e.g. 1920
  customWidth?: number
  customHeight?: number
  lockAspectRatio?: boolean
  namePrefix?: string
}

/**
 * Encodes Canvas ImageData into standard uncompressed Windows BMP (24-bit BGR).
 */
export function imageDataToBmp(imgData: ImageData): Blob {
  const width = imgData.width
  const height = imgData.height
  const data = imgData.data

  // Row size must be padded to a multiple of 4 bytes
  const rowSize = Math.floor((24 * width + 31) / 32) * 4
  const pixelArraySize = rowSize * height
  const fileSize = 54 + pixelArraySize

  const buffer = new ArrayBuffer(fileSize)
  const view = new DataView(buffer)

  // 1. BMP Header (14 bytes)
  view.setUint16(0, 0x424d, false) // 'BM'
  view.setUint32(2, fileSize, true) // File size
  view.setUint16(6, 0, true) // Reserved
  view.setUint16(8, 0, true) // Reserved
  view.setUint32(10, 54, true) // Offset to pixel data

  // 2. DIB Header (BITMAPINFOHEADER - 40 bytes)
  view.setUint32(14, 40, true) // Header size
  view.setInt32(18, width, true) // Width
  view.setInt32(22, height, true) // Height (bottom-to-top)
  view.setUint16(26, 1, true) // Color planes
  view.setUint16(28, 24, true) // Bits per pixel (24-bit RGB)
  view.setUint32(30, 0, true) // Compression: BI_RGB (none)
  view.setUint32(34, pixelArraySize, true) // Image size
  view.setInt32(38, 2835, true) // Horizontal resolution (72 DPI)
  view.setInt32(42, 2835, true) // Vertical resolution (72 DPI)
  view.setUint32(46, 0, true) // Colors in palette
  view.setUint32(50, 0, true) // Important colors

  // 3. Pixel Data (BGR order, bottom-to-top)
  const bytes = new Uint8Array(buffer)
  let offset = 54

  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]

      bytes[offset++] = b // Blue
      bytes[offset++] = g // Green
      bytes[offset++] = r // Red
    }
    // Pad row to multiple of 4 bytes
    const padding = rowSize - width * 3
    for (let p = 0; p < padding; p++) {
      bytes[offset++] = 0
    }
  }

  return new Blob([buffer], { type: 'image/bmp' })
}

/**
 * Wraps PNG blob into an ICO format container (favicons, Windows icons).
 */
export async function pngToIco(pngBlob: Blob, iconWidth = 32, iconHeight = 32): Promise<Blob> {
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer())
  const icoHeaderSize = 6
  const dirEntrySize = 16
  const totalSize = icoHeaderSize + dirEntrySize + pngBytes.length

  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)

  // ICO Header
  view.setUint16(0, 0, true) // Reserved
  view.setUint16(2, 1, true) // Type: 1 = ICO
  view.setUint16(4, 1, true) // Number of images: 1

  // Directory Entry
  view.setUint8(6, iconWidth >= 256 ? 0 : iconWidth) // Width (0 means 256)
  view.setUint8(7, iconHeight >= 256 ? 0 : iconHeight) // Height
  view.setUint8(8, 0) // Palette colors
  view.setUint8(9, 0) // Reserved
  view.setUint16(10, 1, true) // Color planes
  view.setUint16(12, 32, true) // Bits per pixel
  view.setUint32(14, pngBytes.length, true) // Image byte size
  view.setUint32(18, icoHeaderSize + dirEntrySize, true) // Offset to image data

  // Copy PNG image payload
  const bytes = new Uint8Array(buffer)
  bytes.set(pngBytes, icoHeaderSize + dirEntrySize)

  return new Blob([buffer], { type: 'image/x-icon' })
}

/**
 * Applies color filters (grayscale, sepia, invert) onto canvas 2D context.
 */
export function applyCanvasFilter(ctx: CanvasRenderingContext2D, width: number, height: number, filter: ColorFilter) {
  if (filter === 'none') return

  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    if (filter === 'grayscale') {
      const v = 0.299 * r + 0.587 * g + 0.114 * b
      data[i] = v
      data[i + 1] = v
      data[i + 2] = v
    } else if (filter === 'sepia') {
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
    } else if (filter === 'invert') {
      data[i] = 255 - r
      data[i + 1] = 255 - g
      data[i + 2] = 255 - b
    }
  }

  ctx.putImageData(imgData, 0, 0)
}
