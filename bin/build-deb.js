// use dotenv to load environment variables from .env file
// and provide proper envs to build-deb.sh, we could load data/electerm-github-release.json to get data needed
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.dirname(__dirname)
const RELEASE_DATA_FILE = path.join(PROJECT_ROOT, 'data', 'electerm-github-release.json')
const BUILD_DEB_SCRIPT = path.join(PROJECT_ROOT, 'bin', 'build-deb.sh')
const VERCEL_JSON_FILE = path.join(PROJECT_ROOT, 'vercel.json')

async function buildDeb () {
  console.log('Loading release data from:', RELEASE_DATA_FILE)

  // Load release data
  const releaseData = JSON.parse(fs.readFileSync(RELEASE_DATA_FILE, 'utf8'))
  const release = releaseData.release

  // Find the .deb asset for amd64
  const debAsset = release.assets.find(asset =>
    asset.name.includes('.deb') && asset.name.includes('amd64')
  )

  if (!debAsset) {
    throw new Error('No .deb asset found for amd64 architecture')
  }

  console.log('Found .deb asset:', debAsset.name)

  // Prepare environment variables
  const env = {
    ...process.env,
    GPG_KEY_ID: process.env.GPG_KEY_ID || '',
    GPG_PRIVATE_KEY: process.env.GPG_PRIVATE_KEY || '',
    RELEASE_TAG: release.tag_name,
    RELEASE_DATE: release.published_at,
    DEB_ASSET_NAME: debAsset.name,
    DEB_ASSET_URL: debAsset.browser_download_url
  }

  // Pass DEB_FILE_PATH if it exists
  if (process.env.DEB_FILE_PATH) {
    env.DEB_FILE_PATH = process.env.DEB_FILE_PATH
  }

  console.log('Environment variables prepared:')
  console.log('- RELEASE_TAG:', env.RELEASE_TAG)
  console.log('- RELEASE_DATE:', env.RELEASE_DATE)
  console.log('- DEB_ASSET_NAME:', env.DEB_ASSET_NAME)
  console.log('- DEB_ASSET_URL:', env.DEB_ASSET_URL)
  if (env.DEB_FILE_PATH) {
    console.log('- DEB_FILE_PATH:', env.DEB_FILE_PATH)
  }

  // Run build-deb.sh script
  console.log('Running build-deb.sh script...')

  const buildProcess = spawn('bash', [BUILD_DEB_SCRIPT], {
    env,
    stdio: 'inherit'
  })

  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Debian repository build completed successfully!')

      // Update vercel.json with rewrite rules
      updateVercelRewriteRules(release.tag_name, debAsset.name)
    } else {
      console.error('❌ Debian repository build failed with code:', code)
      process.exit(1)
    }
  })

  buildProcess.on('error', (error) => {
    console.error('❌ Failed to start build process:', error)
    process.exit(1)
  })
}

function updateVercelRewriteRules (releaseTag, debFileName) {
  console.log('Updating Vercel rewrite rules...')

  // Read current vercel.json
  let vercelConfig = {}
  if (fs.existsSync(VERCEL_JSON_FILE)) {
    vercelConfig = JSON.parse(fs.readFileSync(VERCEL_JSON_FILE, 'utf8'))
  }

  // Ensure rewrites array exists
  if (!vercelConfig.rewrites) {
    vercelConfig.rewrites = []
  }

  // Remove existing electerm deb rewrite rules
  vercelConfig.rewrites = vercelConfig.rewrites.filter(rewrite =>
    !rewrite.source.includes('/deb/pool/main/e/electerm/')
  )

  // Add new rewrite rule for the current release
  const newRewrite = {
    source: `/deb/pool/main/e/electerm/${debFileName}`,
    destination: `https://gh-proxy.com/https://github.com/electerm/electerm/releases/download/${releaseTag}/${debFileName}`
  }

  vercelConfig.rewrites.push(newRewrite)

  // Write updated vercel.json
  fs.writeFileSync(VERCEL_JSON_FILE, JSON.stringify(vercelConfig, null, 2) + '\n')

  console.log('✅ Updated vercel.json with rewrite rule:')
  console.log(`   ${newRewrite.source} -> ${newRewrite.destination}`)
}

// Run the build process
buildDeb()
