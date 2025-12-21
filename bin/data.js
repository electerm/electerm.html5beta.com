import { config } from 'dotenv'
import { resolve } from 'path'
import { cwd, releaseData } from './common.js'
import fs from 'fs'
import dayjs from 'dayjs'
import j5 from 'json5'

config()

const videos = JSON.parse(fs.readFileSync(resolve(cwd, 'bin/videos.json'), 'utf-8'))

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

      // Determine Windows architecture
      let archType = ''
      if (cname.includes('arm64')) {
        archType = 'arm64'
      } else if (cname.includes('x64') || cname.includes('x86_64')) {
        archType = 'x64'
      } else if (cname.includes('win7')) {
        archType = 'win7'
      } else {
        // Default to x64 for unspecified Windows releases
        archType = 'x64'
      }

      // Add to appropriate architecture group
      if (!prev.windows[archType]) {
        prev.windows[archType] = {
          name: '',
          items: []
        }
      }

      prev.windows[archType].releaseDate = dt
      prev.windows[archType].releaseNote = releaseNote
      prev.windows[archType].items.push(nr)
    } else if (cname.endsWith('.dmg')) {
      // Add descriptions for macOS files
      if (cname.includes('mac10')) {
        nr.desc = 'for macOS 10.x'
      } else if (cname.includes('arm64') || cname.includes('apple-silicon')) {
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
      const isLegacy = cname.includes('-legacy')

      if (cname.endsWith('.rpm')) {
        nr.desc = isLegacy ? 'for Red Hat, Fedora... (glibc < 2.34)' : 'for Red Hat, Fedora...'
      } else if (cname.endsWith('.deb')) {
        nr.desc = isLegacy ? 'for Debian, Ubuntu... (glibc < 2.34, like UOS/Ubuntu 18)' : 'for Debian, Ubuntu...'
      } else if (cname.endsWith('.snap')) {
        nr.desc = 'for all linux that support snap'
      } else if (cname.endsWith('.gz')) {
        nr.desc = isLegacy ? 'for all linux, just extract (glibc < 2.34)' : 'for all linux, just extract'
      } else if (cname.endsWith('.AppImage')) {
        nr.desc = isLegacy ? 'for all linux, just run it (glibc < 2.34)' : 'for all linux, just run it'
      }

      // Determine architecture and legacy status
      let archType = ''

      if (cname.includes('x64') || cname.includes('x86') || cname.includes('amd64')) {
        archType = 'x86_64'
      } else if (cname.includes('arm64') || cname.includes('aarch64')) {
        archType = 'arm64'
      } else if (cname.includes('armv7l')) {
        archType = 'armv7'
      }

      // Add to appropriate architecture group
      const category = isLegacy ? `${archType}_legacy` : archType
      if (!prev.linux[category]) {
        prev.linux[category] = {
          name: '',
          items: []
        }
      }

      prev.linux[category].releaseDate = dt
      prev.linux[category].releaseNote = releaseNote
      prev.linux[category].items.push(nr)
    }
    return prev
  }, {
    linux: {
      x86_64: {
        name: 'Linux x86_64',
        items: []
      },
      x86_64_legacy: {
        name: 'Linux x86_64 Legacy',
        items: []
      },
      arm64: {
        name: 'Linux ARM64',
        items: []
      },
      arm64_legacy: {
        name: 'Linux ARM64 Legacy',
        items: []
      },
      armv7: {
        name: 'Linux ARMv7',
        items: []
      },
      armv7_legacy: {
        name: 'Linux ARMv7 Legacy',
        items: []
      }
    },
    mac: {
      name: 'Mac OS x64',
      items: []
    },
    windows: {
      x64: {
        name: 'Windows x64',
        items: []
      },
      arm64: {
        name: 'Windows ARM64',
        items: []
      },
      win7: {
        name: 'Windows 7 Legacy',
        items: []
      }
    }
  })
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
  videos: videos.videos,
  pages: [
    'sponsor-electerm',
    'deb'
  ],
  langs: createLocaleData(),
  ...createReleaseData(),
  links: [
    {
      url: 'https://electerm.html5beta.com/videos',
      title: 'Electerm Video guide'
    },
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
      url: 'https://electerm-repos.html5beta.com/deb',
      title: 'Debian Repository'
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
      title: 'Simple games for kids',
      url: 'https://g.html5beta.com'
    },
    {
      url: 'https://gh-proxy.com',
      title: 'https://gh-proxy.com'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki',
      title: 'Home'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/AI-model-config-guide',
      title: 'AI model config guide'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Autorun-electerm-when-login-to-os',
      title: 'Autorun electerm when login to os'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/batch-operation',
      title: 'batch operation'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Command-line-usage',
      title: 'Command line usage'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Connection-Hopping-Behavior-Change-in-electerm-since-v1.50.65',
      title: 'Connection Hopping Behavior Change in electerm since v1.50.65'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Contributors',
      title: 'Contributors'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Create-personal-access-token',
      title: 'Create personal access token'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Create-secret-gist',
      title: 'Create secret gist'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Custom-CSS-examples',
      title: 'Custom CSS examples'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Custom-sync-server',
      title: 'Custom sync server'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Deep-link-support',
      title: 'Deep link support'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Default-Profile',
      title: 'Default Profile'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Develop-in-windows',
      title: 'Develop in windows'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/How-Electerm-Gets-the-Current-Working-Directory-(pwd)-in-Terminal-When-"SFTP-Follow-Terminal-Path"-Is-Enabled',
      title: 'How Electerm Gets the Current Working Directory (pwd) in Terminal When "SFTP Follow Terminal Path" Is Enabled'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/How-to-use-ssh-tunnel',
      title: 'How to use ssh tunnel'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/In-windows-can-not-access-port-30975-issue',
      title: 'In windows can not access port 30975 issue'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/RDP-limitation',
      title: 'RDP limitation'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/RDP-session-known-issues',
      title: 'RDP session known issues'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Sponsor-electerm',
      title: 'Sponsor electerm'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Terminal-keywords-highlight-regular-expression-exmaples',
      title: 'Terminal keywords highlight regular expression exmaples'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/VNC‐session‐known‐issues',
      title: 'VNC session known issues'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/Warning-about-sftp-follow-ssh-path-function',
      title: 'Warning about sftp follow ssh path function'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/privacy-notice',
      title: 'privacy notice'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/proxy-format',
      title: 'proxy format'
    },
    {
      url: 'https://github.com/electerm/electerm/wiki/quick-command-templates',
      title: 'quick command templates'
    }
  ]
}
