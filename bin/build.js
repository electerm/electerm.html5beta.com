/**
 * build html with pug template
 */

const pug = require('pug')
const fs = require('fs')
const { resolve } = require('path')
const copy = require('json-deep-copy')
const stylus = require('stylus')
const { exec } = require('shelljs')
const giteeBuild = require('./rebuild-gitee')
const download = require('./download-releases')
const urlFix = require('../bin/url-fix')

function getSourceforgeUrl (url) {
  return `https://master.dl.sourceforge.net/project/electerm.mirror/${arr[len - 2]}/${arr[len - 1]}?viasf=1`
}

function createData () {
  const localeFolder = resolve(__dirname, '../node_modules/@electerm/electerm-locales/dist')

  let assets = []
  let releaseNote = ''
  let version = ''
  let releaseDate = ''
  try {
    const data = require('../data/electerm-github-release.json')
    assets = data.release.assets
    version = data.release.tag_name
    releaseNote = data.release.body
    releaseDate = data.release.published_at
  } catch (e) {
    console.log('no ../data/electerm-github-release.json')
  }
  console.log('version:', version)
  assets = assets.reduce((prev, curr) => {
    const nr = {
      ...curr,
      sourceforgeUrl: getSourceforgeUrl(curr.browser_download_url)
    }
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

  // languages
  return fs.readdirSync(localeFolder)
    .reduce((prev, fileName) => {
      const filePath = resolve(localeFolder, fileName)
      const lang = require(filePath)
      const id = fileName.replace('.js', '')
      const pathHtml = id === 'en_us' ? '/electerm' : '/electerm/index-' + id + '.html'
      const path = resolve(
        __dirname, '..' + (pathHtml === '/electerm' ? '/index.html' : pathHtml.replace('electerm/', ''))
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

function css () {
  const cssPath = resolve(__dirname, '../res/css/style.styl')
  const style = fs.readFileSync(cssPath).toString()
  return new Promise((resolve, reject) => {
    stylus.render(style, { compress: true }, function (err, css) {
      if (err) {
        reject(err)
      } else {
        resolve(css)
      }
    })
  })
}

async function build () {
  const cssStr = await css()
  const arr = createData()
  fs.writeFileSync(
    resolve(__dirname, '../data/data.json')
    , JSON.stringify(arr, null, 2)
  )
  const tempPath = resolve(__dirname, '../views/temp.pug')
  const temp = fs.readFileSync(tempPath).toString()
  const fn = pug.compile(temp, {
    filename: tempPath
  })
  for (const item of arr) {
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
    const data = require(resolve(__dirname, '../data/electerm-github-release.json'))
    version = data.release.tag_name
  } catch (e) {
    console.log('no ../data/electerm-github-release.json')
  }
  await fs.writeFileSync(resolve(__dirname, '../version.html'), version)

  const fo = resolve(__dirname, '../../electerm')
  await exec(`cd ${fo} && git co gh-pages && cp -rf ../electerm.html5beta.com/data ./ && cp ../electerm.html5beta.com/*.html ./ && git add --all && git commit -m 'update' && git push && git push gt gh-pages`)
  await exec(`cd ${fo} && git fetch origin master:master && git push gt master:master`)
  urlFix()
  giteeBuild()
  exec('npm run down')
}

build()
