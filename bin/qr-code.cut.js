#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Crop QR code image - cut 340px from top, 230px from bottom, 100px from left, 100px from right
 * Uses pure Node.js with Canvas API for image processing
 */

import { createCanvas, loadImage } from 'canvas'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function cropImage () {
  try {
    const inputPath = path.join(__dirname, '../src/static/electerm-wechat-group-qr.jpg')
    const outputPath = path.join(__dirname, '../src/static/electerm-wechat-group-qr.jpg')

    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('Input file does not exist:', inputPath)
      process.exit(1)
    }

    console.log('Loading image:', inputPath)

    // Load the image
    const image = await loadImage(inputPath)
    const originalWidth = image.width
    const originalHeight = image.height

    console.log(`Original dimensions: ${originalWidth}x${originalHeight}`)

    // Calculate new dimensions
    const cropTop = 340
    const cropBottom = 100
    const cropLeft = 120
    const cropRight = 120
    const newWidth = originalWidth - cropLeft - cropRight
    const newHeight = originalHeight - cropTop - cropBottom

    if (newHeight <= 0 || newWidth <= 0) {
      console.error('Error: Cropping dimensions would result in zero or negative dimensions')
      console.error(`Original dimensions: ${originalWidth}x${originalHeight}`)
      console.error(`Crop values - top: ${cropTop}, bottom: ${cropBottom}, left: ${cropLeft}, right: ${cropRight}`)
      process.exit(1)
    }

    console.log(`New dimensions: ${newWidth}x${newHeight}`)
    console.log(`Cropping: ${cropTop}px from top, ${cropBottom}px from bottom, ${cropLeft}px from left, ${cropRight}px from right`)

    // Create canvas with new dimensions
    const canvas = createCanvas(newWidth, newHeight)
    const ctx = canvas.getContext('2d')

    // Draw the cropped portion of the image
    ctx.drawImage(
      image,
      cropLeft, cropTop, // Source x, y (start from cropLeft pixels right and cropTop pixels down)
      newWidth, newHeight, // Source width, height
      0, 0, // Destination x, y
      newWidth, newHeight // Destination width, height
    )

    // Save the cropped image
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 })
    fs.writeFileSync(outputPath, buffer)

    console.log('Successfully cropped image saved to:', outputPath)
    console.log(`Final dimensions: ${newWidth}x${newHeight}`)
  } catch (error) {
    console.error('Error processing image:', error)
    process.exit(1)
  }
}

// Check if canvas module is available
try {
  await import('canvas')
} catch (error) {
  console.error('Canvas module not found. Please install it with:')
  console.error('npm install canvas')
  console.error('\nNote: Canvas requires some system dependencies.')
  console.error('On macOS: brew install pkg-config cairo pango libpng jpeg giflib librsvg')
  process.exit(1)
}

// Run the crop function
cropImage()
