import QRCode from 'qrcode'
import fs from 'fs'

async function main() {
  await QRCode.toFile('public/test_sample.png', 'Sample test image for compression and conversion')
  console.log('Sample image created at public/test_sample.png')
}

main().catch(console.error)
