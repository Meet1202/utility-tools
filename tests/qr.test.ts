import { describe, it, expect } from 'vitest'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import { generateQrSvg, getQrModel, isFinderModule } from '../utils/qrEngine'

describe('QR Scanner Compatibility Suite', () => {
  function renderQrToRgba(qr: QRCode.QRCode, margin = 4, scale = 8, dotStyle = 'square'): { data: Uint8ClampedArray, width: number } {
    const size = qr.modules.size
    const totalSize = size + margin * 2
    const pixelDim = totalSize * scale
    const rgba = new Uint8ClampedArray(pixelDim * pixelDim * 4).fill(255)

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (qr.modules.get(r, c)) {
          const isFinder = isFinderModule(r, c, size)
          const startX = (c + margin) * scale
          const startY = (r + margin) * scale

          if (isFinder || dotStyle === 'square') {
            for (let y = startY; y < startY + scale; y++) {
              for (let x = startX; x < startX + scale; x++) {
                const idx = (y * pixelDim + x) * 4
                rgba[idx] = 0
                rgba[idx + 1] = 0
                rgba[idx + 2] = 0
                rgba[idx + 3] = 255
              }
            }
          } else if (dotStyle === 'rounded' || dotStyle === 'dots') {
            const centerX = startX + scale / 2
            const centerY = startY + scale / 2
            const radius = scale * 0.48
            for (let y = startY; y < startY + scale; y++) {
              for (let x = startX; x < startX + scale; x++) {
                const distSq = (x - centerX) ** 2 + (y - centerY) ** 2
                if (distSq <= radius ** 2) {
                  const idx = (y * pixelDim + x) * 4
                  rgba[idx] = 0
                  rgba[idx + 1] = 0
                  rgba[idx + 2] = 0
                  rgba[idx + 3] = 255
                }
              }
            }
          }
        }
      }
    }
    return { data: rgba, width: pixelDim }
  }

  it('scans website URLs reliably', () => {
    const url = 'https://antigravity-tools.com'
    const qr = QRCode.create(url, { errorCorrectionLevel: 'M' })
    const { data, width } = renderQrToRgba(qr)
    const result = jsQR(data, width, width)
    expect(result).not.toBeNull()
    expect(result?.data).toBe(url)
  })

  it('scans Indian UPI Payment links seamlessly', () => {
    const upi = 'upi://pay?pa=merchant@icici&pn=Shop%20Name&am=299&cu=INR&tn=Invoice42'
    const qr = QRCode.create(upi, { errorCorrectionLevel: 'M' })
    const { data, width } = renderQrToRgba(qr)
    const result = jsQR(data, width, width)
    expect(result).not.toBeNull()
    expect(result?.data).toBe(upi)
  })

  it('scans Wi-Fi configuration strings seamlessly', () => {
    const wifi = 'WIFI:T:WPA;S:HomeFiber_5G;P:SuperSecretPass123;H:false;;'
    const qr = QRCode.create(wifi, { errorCorrectionLevel: 'M' })
    const { data, width } = renderQrToRgba(qr)
    const result = jsQR(data, width, width)
    expect(result).not.toBeNull()
    expect(result?.data).toBe(wifi)
  })

  it('scans vCard contact details seamlessly', () => {
    const vcard = 'BEGIN:VCARD\nVERSION:3.0\nN:Doe;John\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD'
    const qr = QRCode.create(vcard, { errorCorrectionLevel: 'M' })
    const { data, width } = renderQrToRgba(qr)
    const result = jsQR(data, width, width)
    expect(result).not.toBeNull()
    expect(result?.data).toBe(vcard)
  })

  it('generates valid SVG XML string with generateQrSvg', () => {
    const svg = generateQrSvg({
      text: 'https://github.com',
      fgColor: '#000000',
      bgColor: '#ffffff',
      margin: 4
    })
    expect(svg).toContain('<svg')
    expect(svg).toContain('viewBox=')
    expect(svg).toContain('</svg>')
  })

  it('scans with center logo (Error Correction Level H)', () => {
    const url = 'https://google.com'
    const qr = QRCode.create(url, { errorCorrectionLevel: 'H' })
    const margin = 4
    const scale = 8
    const { data, width } = renderQrToRgba(qr, margin, scale)

    // Simulate center logo occluding up to 18% of the QR matrix
    const size = qr.modules.size
    const totalSize = size + margin * 2
    const center = Math.floor(totalSize / 2) * scale
    const logoRadius = Math.floor((size * scale) * 0.1) // 20% diameter

    for (let y = center - logoRadius; y <= center + logoRadius; y++) {
      for (let x = center - logoRadius; x <= center + logoRadius; x++) {
        const idx = (y * width + x) * 4
        data[idx] = 255
        data[idx + 1] = 255
        data[idx + 2] = 255
        data[idx + 3] = 255
      }
    }

    const result = jsQR(data, width, width)
    expect(result).not.toBeNull()
    expect(result?.data).toBe(url)
  })
})
