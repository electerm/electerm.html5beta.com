import data from './data.js'
import { buildPug } from './build-bug.js'
import { resolve } from 'path'
import { cwd } from './common.js'
import fs from 'fs/promises'

async function buildVideoPages () {
  const { videos } = data
  const h = process.env.HOST

  // Build videos index page
  const videosIndexFrom = resolve(cwd, 'src/views/videos.pug')
  const videosIndexTo = resolve(cwd, 'public/videos/index.html')
  await fs.mkdir(resolve(cwd, 'public/videos'), { recursive: true })

  await buildPug(videosIndexFrom, videosIndexTo, {
    ...data,
    langCode: data.langs[0].langCode,
    lang: data.langs[0].lang,
    desc: data.langs[0].lang.lang.desc,
    url: h,
    cssUrl: '/index.bundle.css',
    jsUrl: '/index.bundle.js',
    videos
  })

  console.log('✅ Built videos index page')

  // Build individual video pages
  for (const video of videos) {
    const videoDir = resolve(cwd, `public/videos/${video.videoSlug}`)
    await fs.mkdir(videoDir, { recursive: true })

    const videoFrom = resolve(cwd, 'src/views/video.pug')
    const videoTo = resolve(videoDir, 'index.html')

    await buildPug(videoFrom, videoTo, {
      ...data,
      langCode: data.langs[0].langCode,
      lang: data.langs[0].lang,
      desc: video.titleEn || video.title,
      url: `${h}/videos/${video.videoSlug}/`,
      cssUrl: '/index.bundle.css',
      jsUrl: '/index.bundle.js',
      video
    })
  }

  console.log(`✅ Built ${videos.length} individual video pages`)
}

async function main () {
  const { langs, pages } = data
  const from = resolve(cwd, 'src/views/index.pug')
  for (const item of langs) {
    const { id, langCode, lang } = item
    const n = id === 'en_us' ? 'index.html' : 'index-' + id + '.html'
    const to = resolve(cwd, 'public/' + n)
    const h = process.env.HOST
    const view = 'index'
    await buildPug(from, to, {
      ...data,
      langCode,
      lang,
      desc: lang.lang.desc,
      url: h,
      cssUrl: view + '.bundle.css',
      jsUrl: view + '.bundle.js'
    })
  }
  // const installSrc = [
  //   'linux-arm64.tar.gz',
  //   'linux-arm64.deb',
  //   'linux-aarch64.rpm',
  //   'linux-arm64.AppImage',
  //   'linux-armv7l.tar.gz',
  //   'linux-armv7l.deb',
  //   'linux-armv7l.rpm',
  //   'linux-armv7l.AppImage',
  //   'linux-x64.tar.gz',
  //   'linux-x64.deb',
  //   'linux-x86_64.AppImage',
  //   'linux-x86_64.rpm',
  //   'linux-amd64.snap',
  //   'mac-arm64.dmg',
  //   'mac-x64.dmg',
  //   'win-x64.tar.gz',
  //   'win-x64.appx',
  //   'win-x64-installer.exe',
  //   'win-x64-loose.tar.gz',
  //   'win-x64-portable.tar.gz',
  //   'win7.tar.gz'
  // ]

  // Add this after writing version.html:
  const { version } = data
  await fs.writeFile(resolve(cwd, 'public/version.html'), version)

  // Create version-specific files
  // for (const src of installSrc) {
  //   const fileName = src.replace(/\./g, '-')
  //   await fs.writeFile(
  //     resolve(cwd, `public/version-${fileName}.html`),
  //     version
  //   )
  // }
  for (const item of pages) {
    const { langCode, lang } = langs[2]
    const f = resolve(cwd, 'src/views/' + item + '.pug')
    const to = item === 'deb'
      ? resolve(cwd, 'public/deb/index.html')
      : resolve(cwd, 'public/' + item + '.html')
    const h = process.env.HOST
    const cssUrl = item === 'deb'
      ? '/index.bundle.css'
      : 'index.bundle.css'
    const jsUrl = item === 'deb'
      ? '/index.bundle.js'
      : 'index.bundle.js'
    await buildPug(f, to, {
      ...data,
      langCode,
      lang,
      desc: lang.lang.desc,
      url: h,
      cssUrl,
      jsUrl
    })
  }

  // Build video pages
  await buildVideoPages()
}

main()
