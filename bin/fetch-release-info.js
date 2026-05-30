import fs from 'fs/promises'
import { resolve } from 'path'
import axios from 'axios'
import { config as conf } from 'dotenv'

conf()

const cwd = process.cwd()

const token = process.env.GITHUB_TOKEN
const outputPath = resolve(cwd, 'data/electerm-github-release.json')

if (!token) {
  console.error('Error: GITHUB_TOKEN environment variable is not set')
  process.exit(1)
}

async function fetchReleaseInfo () {
  const response = await axios.get('https://api.github.com/repos/electerm/electerm/releases/latest', {
    headers: {
      'User-Agent': 'electerm-website',
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  })

  return {
    action: 'published',
    release: response.data
  }
}

async function main () {
  console.log('Fetching latest release info from GitHub...')
  const releaseInfo = await fetchReleaseInfo()
  if (releaseInfo.release.body) {
    releaseInfo.release.body = releaseInfo.release.body.replace(/\r\n\r\n-------\r\n\r\nDownload下载: \[https:\/\/electerm\.html5beta\.com\]\(https:\/\/electerm\.html5beta\.com\)$/, '')
  }
  // Write to file
  await fs.writeFile(outputPath, JSON.stringify(releaseInfo, null, 2))
  console.log(`Release info saved to ${outputPath}`)
}

main()
