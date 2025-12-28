#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'
import { createCanvas, loadImage } from 'canvas'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const destDir = path.join(__dirname, '../src/static/video-thumb')
const THUMB_WIDTH = 300

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true })
}

async function downloadAndCreateThumbnail (coverUrl, videoSlug) {
  try {
    // Download the image
    const response = await axios.get(coverUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data)

    // Load the image from buffer
    const image = await loadImage(buffer)

    // Calculate new dimensions (maintain aspect ratio)
    const width = THUMB_WIDTH
    const height = Math.round((image.height / image.width) * THUMB_WIDTH)

    // Create canvas and draw resized image
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)

    // Save as JPEG with quality 85
    const outputBuffer = canvas.toBuffer('image/jpeg', { quality: 0.85 })
    const destPath = path.join(destDir, `${videoSlug}.jpg`)
    fs.writeFileSync(destPath, outputBuffer)

    const destSizeKB = (outputBuffer.length / 1024).toFixed(1)
    console.log(`✅ ${videoSlug}.jpg (${destSizeKB}KB)`)
  } catch (error) {
    console.error(`❌ Failed to process ${videoSlug}: ${error.message}`)
  }
}

async function main () {
  // Read videos.json
  const videosPath = path.join(__dirname, 'videos.json')
  const videosData = JSON.parse(fs.readFileSync(videosPath, 'utf8'))
  const lastVideo = videosData.videos[videosData.videos.length - 1]

  const coverUrl = lastVideo.cover
  const videoSlug = lastVideo.videoSlug

  console.log(`Processing last video: ${lastVideo.title}`)
  console.log(`Cover URL: ${coverUrl}`)
  console.log(`Video Slug: ${videoSlug}`)
  console.log(`Destination: ${destDir}\n`)

  await downloadAndCreateThumbnail(coverUrl, videoSlug)

  console.log('\n✨ Done!')
}

main()
