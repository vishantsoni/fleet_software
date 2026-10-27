const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const inputSvg = path.join(__dirname, '..', 'public/icons/icon.svg')
const outputDir = path.join(__dirname, '..', 'public/icons')

const sizes = {
  'icon-192.png': 192,
  'icon-512.png': 512,
  'apple-touch-icon.png': 180,
}

const maskableSizes = {
  'maskable-icon-192.png': 192,
  'maskable-icon-512.png': 512,
}

async function generateIcons() {
  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, filename))
    console.log(`Generated ${filename} (${size}x${size})`)
  }

  for (const [filename, size] of Object.entries(maskableSizes)) {
    const svgBuffer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="80" fill="#1e293b"/><path d="M372 190l-90 90 90 90-26 26-116-116 116-116z" fill="#38bdf8"/></svg>`)
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, filename))
    console.log(`Generated ${filename} (${size}x${size})`)
  }

  console.log('All icons generated successfully!')
}

generateIcons().catch(console.error)
