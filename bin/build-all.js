import data from './data.js'
import { buildPug } from './build-bug.js'
import { resolve } from 'path'
import { cwd } from './common.js'
import fs from 'fs/promises'

async function main () {
  const { langs } = data
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
  const { version } = data
  await fs.writeFile(resolve(cwd, 'public/version.html'), version)
}

main()
