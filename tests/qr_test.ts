import { describe, it, expect } from 'vitest'
import QRCode from 'qrcode'

describe('QRCode library', () => {
  it('creates valid QR code object and matrix', async () => {
    const qr = QRCode.create('https://github.com', { errorCorrectionLevel: 'M' })
    expect(qr.modules.size).toBeGreaterThan(20)
    expect(typeof qr.modules.get(0, 0)).toBe('number') // or boolean/number

    const svg = await QRCode.toString('https://github.com', {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 2
    })
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })
})
