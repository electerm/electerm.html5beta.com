#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Crop QR code image - cut 350px from top, 100px from bottom, 120px from left, 120px from right
 * Create 3-paper stack effect with rotated background papers
 * Uses pure Node.js with Canvas API for image processing
 */

import { createCanvas, loadImage } from 'canvas'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function cropImage () {
  try {
    const fix = process.env.TEST ? '-test' : ''
    const inputPath = path.join(__dirname, '../src/static/electerm-wechat-group-qr.jpg')
    const outputPath = path.join(__dirname, '../src/static/electerm-wechat-group-qr' + fix + '.jpg')

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
    const cropTop = 350
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

    // Paper stack settings
    const paperPadding = 60 // Extra space for rotated papers
    const rotationAngle = 5 * Math.PI / 180 // 5 degrees in radians

    // Create canvas with extra space for rotated papers
    const canvasWidth = newWidth + paperPadding * 2
    const canvasHeight = newHeight + paperPadding * 2
    const canvas = createCanvas(canvasWidth, canvasHeight)
    const ctx = canvas.getContext('2d')

    // Fill background with light color
    ctx.fillStyle = '#f8f8f8'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Helper function to draw a paper with shadow
    function drawPaper (x, y, width, height, rotation, shadowIntensity) {
      ctx.save()

      // Move to center of where paper should be
      ctx.translate(x + width / 2, y + height / 2)
      ctx.rotate(rotation)

      // Draw shadow
      ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity})`
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 4
      ctx.shadowOffsetY = 4

      // Draw paper
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(-width / 2, -height / 2, width, height)

      // Add subtle border
      ctx.shadowColor = 'transparent'
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.lineWidth = 1
      ctx.strokeRect(-width / 2, -height / 2, width, height)

      ctx.restore()
    }

    // Draw background papers (rotated)
    const centerX = canvasWidth / 2 - newWidth / 2
    const centerY = canvasHeight / 2 - newHeight / 2

    // Bottom paper (rotated left)
    drawPaper(centerX - 3, centerY + 6, newWidth, newHeight, -rotationAngle, 0.15)

    // Middle paper (rotated right)
    drawPaper(centerX + 3, centerY + 3, newWidth, newHeight, rotationAngle, 0.2)

    // Top paper (no rotation) - we'll draw the actual image on this one
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    // Draw white background for top paper
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(centerX, centerY, newWidth, newHeight)

    // Reset shadow for the actual image
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Draw the cropped portion of the image onto the top paper
    ctx.drawImage(
      image,
      cropLeft, cropTop, // Source x, y (start from cropLeft pixels right and cropTop pixels down)
      newWidth, newHeight, // Source width, height
      centerX, centerY, // Destination x, y (centered on top paper)
      newWidth, newHeight // Destination width, height
    )

    // Add subtle border to top paper
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(centerX, centerY, newWidth, newHeight)

    ctx.restore()

    // Save the cropped image
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 })
    fs.writeFileSync(outputPath, buffer)

    console.log('Successfully created 3-paper stack effect with QR code saved to:', outputPath)
    console.log(`Final dimensions: ${canvasWidth}x${canvasHeight} (including paper stack)`)
    console.log(`QR code content: ${newWidth}x${newHeight}`)
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
