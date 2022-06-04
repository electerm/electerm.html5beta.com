const { readdirSync } = require('fs')
const { resolve } = require('path')
const replace = require('replace-in-file')

function fix (name, folder) {
  const p = resolve(folder, name)
  const options = {
    files: [p],
    from: /href="\/electerm\//g,
    to: 'href="/'
  }
  const options1 = {
    files: [p],
    from: 'href="/electerm"',
    to: 'href="/"'
  }
  replace(options)
    .then(() => {
      return replace(options1)
    })
    .then(() => {
      console.log('[INFO] Successfully fix', p)
    })
    .catch(e => {
      console.error('[ERR] Error fix', p)
      console.error(e)
      process.exit(1)
    })
}

function main () {
  const p = resolve(__dirname, '..')
  const all = readdirSync(p).filter(p => p.startsWith('index'))
  for (const n of all) {
    fix(n, p)
  }
}

module.exports = main

// main()