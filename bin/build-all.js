import data from './data.js'
import { buildPug } from './build-bug.js'
import { resolve } from 'path'
import { cwd } from './common.js'
import fs from 'fs/promises'

const REDIRECT_TEMPLATE = (target) => `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${target}"></head><body></body></html>`

async function buildVideoPages () {
  const { videos } = data
  const h = process.env.HOST
  const enLang = data.langs.find(l => l.id === 'en_us')
  const { langCode, lang } = enLang

  const videosIndexFrom = resolve(cwd, 'src/views/videos.pug')
  const videosIndexTo = resolve(cwd, 'public/videos/index.html')
  await fs.mkdir(resolve(cwd, 'public/videos'), { recursive: true })

  await buildPug(videosIndexFrom, videosIndexTo, {
    ...data,
    langCode,
    lang,
    desc: lang.lang.videosTitle,
    url: `${h}/videos`,
    cssUrl: '/index.bundle.css',
    videos
  })

  for (const video of videos) {
    const videoSlug = video.videoSlug
    const videoDir = resolve(cwd, `public/videos/${videoSlug}`)
    await fs.mkdir(videoDir, { recursive: true })

    const videoFrom = resolve(cwd, 'src/views/video.pug')
    const videoTo = resolve(videoDir, 'index.html')

    await buildPug(videoFrom, videoTo, {
      ...data,
      langCode,
      lang,
      desc: video.titleEn || video.title,
      url: `${h}/videos/${videoSlug}/`,
      cssUrl: '/index.bundle.css',
      video
    })
  }

  console.log(`✅ Built ${videos.length} video pages`)
}

async function main () {
  const { langs, pages } = data
  const from = resolve(cwd, 'src/views/index.pug')
  const h = process.env.HOST

  // Build index page for each language
  for (const item of langs) {
    const { id, slug, langCode, lang } = item

    if (id === 'en_us') {
      // English → public/index.html
      const to = resolve(cwd, 'public/index.html')
      await buildPug(from, to, {
        ...data,
        langCode,
        lang,
        desc: lang.lang.desc,
        url: h,
        cssUrl: '/index.bundle.css'
      })
    } else {
      // Other locales → public/{slug}/index.html + public/index-{id}.html redirect
      const dir = resolve(cwd, 'public/' + slug)
      await fs.mkdir(dir, { recursive: true })

      const to = resolve(dir, 'index.html')
      await buildPug(from, to, {
        ...data,
        langCode,
        lang,
        desc: lang.lang.desc,
        url: h + '/' + slug + '/',
        cssUrl: '/index.bundle.css'
      })

      // Build redirect page at old path
      const redirectFrom = resolve(cwd, 'public/index-' + id + '.html')
      const target = h + '/' + slug + '/'
      await fs.writeFile(redirectFrom, REDIRECT_TEMPLATE(target))
    }
  }

  console.log(`✅ Built index pages for ${langs.length} languages`)

  const { version } = data
  await fs.writeFile(resolve(cwd, 'public/version.html'), version)

  // Build static pages (English only)
  const enLang = langs.find(l => l.id === 'en_us')
  const { langCode, lang } = enLang
  for (const item of pages) {
    const f = resolve(cwd, 'src/views/' + item + '.pug')

    if (item === 'deb') {
      const debDir = resolve(cwd, 'public/deb')
      await fs.mkdir(debDir, { recursive: true })
      await buildPug(f, resolve(debDir, 'index.html'), {
        ...data,
        langCode,
        lang,
        desc: lang.lang.debSubtitle,
        url: `${h}/deb/`,
        cssUrl: '/index.bundle.css'
      })
    } else {
      // Build at /{item}/index.html
      const dir = resolve(cwd, `public/${item}`)
      await fs.mkdir(dir, { recursive: true })

      const descKey = item === 'sponsor-electerm' ? 'sponsorTitle' : 'privacyPolicy'
      await buildPug(f, resolve(dir, 'index.html'), {
        ...data,
        langCode,
        lang,
        desc: lang.lang[descKey] || lang.lang.desc,
        url: `${h}/${item}/`,
        cssUrl: '/index.bundle.css'
      })

      // Redirect from old /{item}.html
      const redirectFrom = resolve(cwd, `public/${item}.html`)
      const target = `${h}/${item}/`
      await fs.writeFile(redirectFrom, REDIRECT_TEMPLATE(target))
    }
  }

  console.log('✅ Built static pages (English)')

  await buildVideoPages()
}

main()
