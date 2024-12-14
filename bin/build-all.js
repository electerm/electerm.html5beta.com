import data from './data.js'
import { buildPug } from './build-bug.js'
import { resolve } from 'path'
import { cwd } from './common.js'
import fs from 'fs/promises'

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
      desc: lang.lang.app.desc,
      url: h,
      cssUrl: h + '/' + view + '.bundle.css',
      jsUrl: h + '/' + view + '.bundle.js'
    })
  }
  const installSrc = [
    'linux-arm64.tar.gz',
    'linux-arm64.deb',
    'linux-aarch64.rpm',
    'linux-arm64.AppImage',
    'linux-armv7l.tar.gz',
    'linux-armv7l.deb',
    'linux-armv7l.rpm',
    'linux-armv7l.AppImage',
    'linux-x64.tar.gz',
    'linux-x64.deb',
    'linux-x86_64.AppImage',
    'linux-x86_64.rpm',
    'linux-amd64.snap',
    'mac-arm64.dmg',
    'mac-x64.dmg',
    'win-x64.tar.gz',
    'win-x64.appx',
    'win-x64-installer.exe',
    'win-x64-loose.tar.gz',
    'win-x64-portable.tar.gz',
    'win7.tar.gz'
  ]

  // Add this after writing version.html:
  const { version } = data
  await fs.writeFile(resolve(cwd, 'public/version.html'), version)

  // Create version-specific files
  for (const src of installSrc) {
    const fileName = src.replace(/\./g, '-')
    await fs.writeFile(
      resolve(cwd, `public/version-${fileName}.html`),
      version
    )
  }
  for (const item of pages) {
    const { langCode, lang } = langs[2]
    const f = resolve(cwd, 'src/views/' + item + '.pug')
    const to = resolve(cwd, 'public/' + item + '.html')
    const h = process.env.HOST
    await buildPug(f, to, {
      ...data,
      langCode,
      lang,
      desc: lang.lang.app.desc,
      url: h,
      cssUrl: h + '/index.bundle.css',
      jsUrl: h + '/index.bundle.js'
    })
  }
}

main()
