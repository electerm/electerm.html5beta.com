#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read videos.json
const videosPath = path.join(__dirname, 'videos.json')
const videosData = JSON.parse(fs.readFileSync(videosPath, 'utf-8'))

// Create destination directory if it doesn't exist
const destDir = path.join(__dirname, '../src/static/videos')
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true })
}

// Function to download image
async function downloadImage (url, slug) {
  try {
    // Get file extension from URL
    const urlObj = new URL(url)
    const ext = path.extname(urlObj.pathname) || '.jpg'
    const filename = `${slug}${ext}`
    const filepath = path.join(destDir, filename)

    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipped: ${filename} (already exists)`)
      return
    }

    // Download image
    const response = await axios({
      method: 'get',
      url,
      responseType: 'arraybuffer'
    })

    // Save to file
    fs.writeFileSync(filepath, response.data)
    console.log(`✅ Downloaded: ${filename}`)
  } catch (error) {
    console.error(`❌ Failed to download ${slug}: ${error.message}`)
  }
}

// Main function
async function main () {
  const videos = videosData.videos || []
  console.log(`Found ${videos.length} videos to process`)
  console.log(`Destination: ${destDir}\n`)

  for (const video of videos) {
    if (video.cover && video.videoSlug) {
      await downloadImage(video.cover, video.videoSlug)
    } else {
      console.warn(`⚠️  Skipped: Missing cover or slug for "${video.title}"`)
    }
  }

  console.log('\n✨ Done!')
}

main()
