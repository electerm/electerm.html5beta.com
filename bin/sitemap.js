// create sitemap
import fs from 'fs/promises'
import { createSitemap } from 'sitemaps'
import { cwd } from './common.js'
import { resolve } from 'path'
import dayjs from 'dayjs'
import data from './data.js'

const fmt = 'YYYY-MM-DD'

async function buildPages () {
  const to = 'public'
  const from = resolve(cwd, to)
  const list = await fs.readdir(from)
  const arr = []
  for (const f of list) {
    if (f.startsWith('index-')) {
      const ff = resolve(from, f)
      const s = await fs.stat(ff)
      const host = data.host || 'https://electerm.html5beta.com'
      arr.push({
        loc: host + '/' + f,
        lastmod: dayjs(s.mtime).format(fmt),
        changefreq: 'weekly',
        priority: 0.8
      })
    }
  }
  return arr
}

async function buildSiteMap () {
  const urls = []
  const index = resolve(
    cwd, 'public/index.html'
  )
  const state = await fs.stat(index)
  const host = data.host || 'https://electerm.html5beta.com'
  urls.push({
    loc: host,
    lastmod: dayjs(state.mtime).format(fmt),
    changefreq: 'weekly',
    priority: 1
  })
  for (const page of data.pages) {
    if (page !== 'deb') {
      urls.push({
        loc: host + '/' + page + '.html',
        lastmod: dayjs(state.mtime).format(fmt),
        changefreq: 'weekly',
        priority: 1
      })
    }
  }
  const arr = await buildPages()
  urls.push(...arr)

  // Add videos index page
  urls.push({
    loc: host + '/videos',
    lastmod: dayjs().format(fmt),
    changefreq: 'weekly',
    priority: 0.9
  })

  // Add individual video pages
  if (data.videos && data.videos) {
    for (const video of data.videos) {
      urls.push({
        loc: `${host}/videos/${video.videoSlug}/`,
        lastmod: dayjs().format(fmt),
        changefreq: 'monthly',
        priority: 0.7
      })
    }
    console.log(`✅ Added ${data.videos.length} video pages to sitemap`)
  }

  createSitemap({
    filePath: resolve(cwd, 'public/sitemap.xml'),
    urls
  })
}

buildSiteMap()
