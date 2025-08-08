import { config } from 'dotenv'
import { resolve } from 'path'
import { cwd, releaseData } from './common.js'
import fs from 'fs'
import dayjs from 'dayjs'
import j5 from 'json5'

config()

function getSourceforgeUrl (url) {
  const arr = url.split('/')
  const len = arr.length
  return `https://master.dl.sourceforge.net/project/electerm.mirror/${arr[len - 2]}/${arr[len - 1]}?viasf=1`
}

function getCdnUrl (url) {
  return url.replace('github.com', 'download-electerm.html5beta.com')
}

function convertToProperLangCode (code) {
  const langMappings = {
    ar_ar: 'ar',
    de_de: 'de',
    en_us: 'en-US',
    es_es: 'es-ES',
    fr_fr: 'fr',
    ja_jp: 'ja',
    ko_kr: 'ko',
    pt_br: 'pt-BR',
    ru_ru: 'ru',
    tr_tr: 'tr',
    zh_cn: 'zh-CN',
    zh_tw: 'zh-TW'
  }

  return langMappings[code] || code
}

function createLocaleData () {
  // languages
  const localeFolder = resolve(cwd, 'node_modules/@electerm/electerm-locales/dist')
  const pre = process.env.HOST
  return fs.readdirSync(localeFolder)
    .reduce((prev, fileName) => {
      if (!fileName.endsWith('js')) {
        return prev
      }
      const filePath = resolve(localeFolder, fileName)
      const lang = j5.parse(fs.readFileSync(filePath, 'utf-8').replace('module.exports=exports.default=', ''))
      const id = fileName.replace('.js', '')
      const url = id === 'en_us' ? pre : pre + '/index-' + id + '.html'
      prev = [
        ...prev,
        {
          id,
          langCode: convertToProperLangCode(id),
          lang,
          url
        }
      ]
      return prev
    }, [])
}

function createReleaseData () {
  const data = releaseData
  const assets = data.release.assets
  const version = data.release.tag_name
  const releaseNote = data.release.body
  console.log('version:', version)
  const dt = dayjs(assets[0].created_at).format('YYYY-MM-DD')
  const arr = assets.reduce((prev, curr) => {
    const nr = {
      ...curr,
      sourceforgeUrl: getSourceforgeUrl(curr.browser_download_url),
      cdnUrl: getCdnUrl(curr.browser_download_url)
    }
    const cname = curr.name
    if (
      cname.includes('win') &&
      !cname.endsWith('.blockmap') &&
      !cname.includes('.appx') &&
      !cname.includes('loose')
    ) {
      // Add descriptions for Windows files
      if (cname.includes('installer') && cname.endsWith('.exe')) {
        nr.desc = 'Windows installer (recommended)'
      } else if (cname.endsWith('.exe') && !cname.includes('installer')) {
        nr.desc = 'Portable executable'
      } else if (cname.endsWith('.zip')) {
        nr.desc = 'Portable zip archive'
      } else if (cname.endsWith('.msi')) {
        nr.desc = 'Windows installer package'
      } else if (cname.includes('portable') && cname.endsWith('.tar.gz')) {
        nr.desc = 'Portable archive'
      } else if (cname.includes('win7')) {
        nr.desc = 'Legacy Windows 7 compatible'
      } else if (cname.endsWith('.tar.gz')) {
        nr.desc = 'Just extract and run'
      }
      prev.windows.releaseNote = releaseNote
      prev.windows.releaseDate = dt
      prev.windows.items.push(nr)
    } else if (cname.endsWith('.dmg')) {
      // Add descriptions for macOS files
      if (cname.includes('arm64') || cname.includes('apple-silicon')) {
        nr.desc = 'for Apple Silicon Macs (M1, M2, etc.)'
      } else if (cname.includes('x64') || cname.includes('intel')) {
        nr.desc = 'for Intel Macs'
      } else {
        nr.desc = 'macOS disk image'
      }
      prev.mac.releaseNote = releaseNote
      prev.mac.releaseDate = dt
      prev.mac.items.push(nr)
    } else if (cname.includes('linux')) {
      if (cname.endsWith('.rpm')) {
        nr.desc = 'for Red Hat, Fedora...'
      } else if (cname.endsWith('.deb')) {
        nr.desc = 'for Debian, Ubuntu...'
      } else if (cname.endsWith('.snap')) {
        nr.desc = 'for all linux that support snap'
      } else if (cname.endsWith('.gz')) {
        nr.desc = 'for all linux, just extract'
      } else if (cname.endsWith('.AppImage')) {
        nr.desc = 'for all linux, just run it'
      }
      nr.tag = 'ARM64 Beta'
      nr.index = 2
      if (cname.includes('x64') || cname.includes('x86') || cname.includes('amd64')) {
        nr.index = 1
        nr.tag = 'x86/64'
      } else if (cname.includes('armv7l')) {
        nr.tag = 'ARM Beta'
        nr.index = 3
      }
      prev.linux.releaseDate = dt
      prev.linux.releaseNote = releaseNote
      prev.linux.items.push(nr)
    }
    return prev
  }, {
    linux: {
      name: 'Linux x86/x64/arm/arm64',
      items: []
    },
    mac: {
      name: 'Mac OS x64',
      items: []
    },
    windows: {
      name: 'Windows 10/11 x64',
      items: []
    }
  })
  arr.linux.items.sort((a, b) => a.index - b.index)
  return {
    assets: arr,
    version
  }
}

export default {
  desc: 'Terminal/ssh/telnet/serialport/sftp client in Linux, Mac, Win',
  keywords: 'ssh,open-source,terminal,telnet,sftp,file-manager,linux-app,serialport,windows-app,macos-app,electerm',
  siteName: 'electerm',
  host: process.env.HOST,
  pages: [
    'sponsor-electerm'
  ],
  langs: createLocaleData(),
  ...createReleaseData(),
  links: [
    {
      url: 'https://github.com/electerm/electerm',
      title: 'GitHub'
    },
    {
      url: 'https://github.com/electerm/electerm-web',
      title: 'electerm-web'
    },
    {
      url: 'https://github.com/electerm/electerm-web-docker',
      title: 'electerm-web-docker'
    },
    {
      url: 'https://github.com/electerm/electerm-locales',
      title: 'electerm-locales'
    },
    {
      url: 'https://www.microsoft.com/store/apps/9NCN7272GTFF',
      title: 'Windows Store'
    },
    {
      url: 'https://snapcraft.io/electerm',
      title: 'Snap Store'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Know-issues',
      title: 'Know issues'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Troubleshoot',
      title: 'Troubleshoot'
    },
    {
      url: 'https://github.com/electerm/electerm/discussions',
      title: 'Discussion'
    },
    {
      url: 'https://electerm.html5beta.com/sponsor-electerm.html',
      title: 'Sponsor Electerm'
    },
    {
      url: 'https://github.com/mbadolato/iTerm2-Color-Schemes/tree/master/electerm',
      title: 'Themes'
    },
    {
      url: 'https://electerm-cloud.html5beta.com/',
      title: 'electerm cloud'
    },
    {
      url: 'https://github.com/tylerlong/manate',
      title: 'manate'
    },
    {
      url: 'https://gh-proxy.com',
      title: 'https://gh-proxy.com'
    },
    {
      url: 'https://dartnode.com?aff=NuttyMonkey521',
      title: 'DartNode'
    }
  ]
}
