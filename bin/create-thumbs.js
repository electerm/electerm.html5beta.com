#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createCanvas, loadImage } from 'canvas'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sourceDir = path.join(__dirname, '../src/static/videos')
const destDir = path.join(__dirname, '../src/static/videos-thumbs')
const THUMB_WIDTH = 300

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true })
}

async function createThumbnail(sourcePath, destPath) {
  try {
    // Load the original image
    const image = await loadImage(sourcePath)
    
    // Calculate new dimensions (maintain aspect ratio)
    const width = THUMB_WIDTH
    const height = Math.round((image.height / image.width) * THUMB_WIDTH)
    
    // Create canvas and draw resized image
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)
    
    // Save as JPEG with quality 85
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 })
    fs.writeFileSync(destPath, buffer)
    
    const sourceSizeKB = (fs.statSync(sourcePath).size / 1024).toFixed(1)
    const destSizeKB = (buffer.length / 1024).toFixed(1)
    console.log(`✅ ${path.basename(destPath)} (${sourceSizeKB}KB → ${destSizeKB}KB)`)
  } catch (error) {
    console.error(`❌ Failed to process ${path.basename(sourcePath)}: ${error.message}`)
  }
}

async function main() {
  const files = fs.readdirSync(sourceDir)
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f))
  
  console.log(`Found ${imageFiles.length} images to process`)
  console.log(`Source: ${sourceDir}`)
  console.log(`Destination: ${destDir}`)
  console.log(`Thumbnail width: ${THUMB_WIDTH}px\n`)
  
  for (const file of imageFiles) {
    const sourcePath = path.join(sourceDir, file)
    const destPath = path.join(destDir, file.replace(/\.(jpg|jpeg|png)$/i, '.jpg'))
    
    // Skip if thumbnail already exists
    if (fs.existsSync(destPath)) {
      console.log(`⏭️  Skipped: ${file} (already exists)`)
      continue
    }
    
    await createThumbnail(sourcePath, destPath)
  }
  
  console.log('\n✨ Done!')
}

main()
