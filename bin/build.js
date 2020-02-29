/**
 * build html with pug template
 */

const pug = require('pug')
const fs = require('fs')
const {resolve} = require('path')
const copy = require('json-deep-copy')
const stylus = require('stylus')
const { exec } = require('shelljs')

function createData() {

  let localeFolder = resolve(__dirname, '../node_modules/@electerm/electerm-locales/locales')

  let assets = []
  let releaseNote = ''
  let version = ''
  try {
    let data = require('../data/electerm-github-release.json')
    assets = data.release.assets
    version = data.release.tag_name
    releaseNote = data.release.body
    releaseDate = data.release.published_at
  } catch(e) {
    console.log('no ../data/electerm-github-release.json')
  }
  console.log('version:', version)
  assets = assets.reduce((prev, curr) => {
    if (curr.name.includes('win')) {
      prev.windows.items.push(curr)
    } else if (curr.name.includes('mac')) {
      prev.mac.items.push(curr)
    } else {
      if (curr.name.endsWith('.rpm')) {
        curr.desc = 'for Red Hat, Fedora...'
      } else if (curr.name.endsWith('.deb')) {
        curr.desc = 'for Debian, Ubuntu...'
      } else if (curr.name.endsWith('.snap')) {
        curr.desc = 'for all linux that support snap'
      } else if (curr.name.endsWith('.gz')) {
        curr.desc = 'for all linux x64, just extract'
      }
      prev.linux.items.push(curr)
    }
    return prev
  }, {
    linux: {
      name: 'linux x86 x64',
      items: []
    },
    mac: {
      name: 'mac os x64',
      items: []
    },
    windows: {
      name: 'windows 7/8/10 x86 x64',
      items: []
    }
  })

  //languages
  return fs.readdirSync(localeFolder)
    .reduce((prev, fileName) => {
      let filePath = resolve(localeFolder, fileName)
      let lang = require(filePath)
      let id = fileName.replace('.js', '')
      let pathHtml = id === 'en_us' ? '/' : '/index-' + id + '.html'
      let path = resolve(
        __dirname, '..' + (pathHtml == '/' ? '/index.html' : pathHtml)
      )
      prev = [
        ...prev,
        {
          id,
          lang,
          pathHtml,
          assets,
          version,
          releaseNote,
          releaseDate,
          siteKeywords: 'electron,ternimal,electerm,ssh,sftp',
          siteName: 'electerm',
          path
        }
      ]
      return prev
    }, [])
}

function css() {
  let cssPath = resolve(__dirname, '../res/css/style.styl')
  let style = fs.readFileSync(cssPath).toString()
  return new Promise((resolve, reject) => {
    stylus.render(style, {compress: true}, function(err, css){
      if (err) {
        reject(err)
      } else {
        resolve(css)
      }
    })
  })
}

async function build() {
  let cssStr = await css()
  let arr = createData()
  fs.writeFileSync(
    resolve(__dirname, '../data/data.json')
    ,JSON.stringify(arr, null, 2)
  )
  let tempPath = resolve(__dirname, '../views/temp.pug')
  let temp = fs.readFileSync(tempPath).toString()
  let fn = pug.compile(temp, {
    filename: tempPath
  })
  for (let item of arr) {
    let html = fn({
      data: {
        ...item,
        langs: copy(arr)
      }
    })
    html = html.replace(
      '</head>',
      `<style>${cssStr}</style></head>`
    )
    fs.writeFileSync(item.path, html)
  }

  // version
  let version = ''
  try {
    let data = require(resolve(__dirname, '../data/electerm-github-release.json'))
    version = data.release.tag_name
  } catch(e) {
    console.log('no ../data/electerm-github-release.json')
  }
  await fs.writeFileSync(resolve(__dirname, '../version.html'), version)

  const fo = resolve(__dirname, '../../electerm')
  await exec(`cd ${fo} && git co gh-pages && cp ../electerm.html5beta.com/*.html ./ && git add --all && git commit -m 'update' && git push`)
}

build()