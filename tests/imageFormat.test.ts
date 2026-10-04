import { describe, it, expect } from 'vitest'
import { imageDataToBmp, pngToIco } from '../utils/imageFormat'

describe('Image Format Encoders', () => {
  it('encodes ImageData to valid Windows BMP file', () => {
    // 2x2 mock ImageData
    const width = 2
    const height = 2
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,   0, 255, 0, 255,
      0, 0, 255, 255,   255, 255, 255, 255
    ])
    const imgData = { width, height, data } as unknown as ImageData

    const bmpBlob = imageDataToBmp(imgData)
    expect(bmpBlob.type).toBe('image/bmp')
    expect(bmpBlob.size).toBeGreaterThan(54)
  })

  it('wraps PNG blob into valid ICO container', async () => {
    const dummyPng = new Blob(['mock png binary data'], { type: 'image/png' })
    const icoBlob = await pngToIco(dummyPng, 32, 32)
    expect(icoBlob.type).toBe('image/x-icon')
    expect(icoBlob.size).toBeGreaterThan(22)
  })
})
