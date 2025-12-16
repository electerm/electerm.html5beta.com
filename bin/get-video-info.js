#!/usr/bin/env node

/**
 * Fetch video information from Bilibili playlist
 * Usage: node bin/get-video-info.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Bilibili playlist ID
const SEASON_ID = '5461229'
const MID = '14001525' // User ID

// Bilibili API endpoint for season/playlist
const API_URL = 'https://api.bilibili.com/x/polymer/web-space/seasons_archives_list'

/**
 * Fetch video list from Bilibili API
 */
async function fetchVideoList () {
  try {
    console.log('Fetching video information from Bilibili...')

    const url = new URL(API_URL)
    url.searchParams.append('mid', MID)
    url.searchParams.append('season_id', SEASON_ID)
    url.searchParams.append('page_num', '1')
    url.searchParams.append('page_size', '100')

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://space.bilibili.com/',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.code !== 0) {
      throw new Error(`API error! code: ${data.code}, message: ${data.message}`)
    }

    return data.data
  } catch (error) {
    console.error('Error fetching video list:', error.message)
    throw error
  }
}

/**
 * Process and format video information
 */
function processVideoData (data) {
  if (!data || !data.archives) {
    console.warn('No video data found')
    return {
      meta: {},
      videos: []
    }
  }

  const videos = data.archives.map(video => ({
    aid: video.aid,
    bvid: video.bvid,
    title: video.title,
    description: video.desc || '',
    link: `https://www.bilibili.com/video/${video.bvid}`,
    cover: video.pic,
    author: video.owner?.name || '',
    authorMid: video.owner?.mid || '',
    duration: video.duration,
    pubdate: video.pubdate,
    publishDate: new Date(video.pubdate * 1000).toISOString(),
    stats: {
      view: video.stat?.view || 0,
      danmaku: video.stat?.danmaku || 0,
      reply: video.stat?.reply || 0,
      favorite: video.stat?.favorite || 0,
      coin: video.stat?.coin || 0,
      share: video.stat?.share || 0,
      like: video.stat?.like || 0
    }
  }))

  return {
    meta: {
      seasonId: SEASON_ID,
      mid: MID,
      seasonName: data.meta?.name || '',
      seasonDescription: data.meta?.description || '',
      total: data.meta?.total || videos.length,
      fetchedAt: new Date().toISOString()
    },
    videos
  }
}

/**
 * Save video data to JSON file
 */
function saveToFile (data) {
  const outputPath = path.join(__dirname, 'videos.json')

  try {
    fs.writeFileSync(
      outputPath,
      JSON.stringify(data, null, 2),
      'utf8'
    )

    console.log(`✓ Successfully saved ${data.videos.length} videos to ${outputPath}`)
    console.log(`  Season: ${data.meta.seasonName}`)
    console.log(`  Total videos: ${data.meta.total}`)
  } catch (error) {
    console.error('Error saving file:', error.message)
    throw error
  }
}

/**
 * Main function
 */
async function main () {
  try {
    const rawData = await fetchVideoList()
    const processedData = processVideoData(rawData)
    saveToFile(processedData)

    console.log('\n✓ Done!')
  } catch (error) {
    console.error('\n✗ Failed to fetch video information')
    process.exit(1)
  }
}

// Run the script
main()
