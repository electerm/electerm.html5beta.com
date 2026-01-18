import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const wikiRepo = 'https://github.com/electerm/electerm.wiki.git'
const tempDir = path.join(__dirname, '..', 'temp-wiki')

// Clone the wiki repo
exec(`git clone ${wikiRepo} ${tempDir}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error cloning wiki: ${error}`)
    return
  }

  // Get all .md files
  const mdFiles = fs.readdirSync(tempDir).filter(file => file.endsWith('.md'))

  const links = []

  mdFiles.forEach(file => {
    const filePath = path.join(tempDir, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    let title = ''

    // Find the first # header
    for (const line of lines) {
      if (line.startsWith('# ')) {
        title = line.substring(2).trim()
        break
      }
    }

    if (!title) {
      // If no # header, use filename without .md
      title = file.replace('.md', '').replace(/-/g, ' ')
    }

    // Construct URL: filename without .md, with - instead of spaces
    const urlSlug = file.replace('.md', '').replace(/ /g, '-')
    const url = `https://github.com/electerm/electerm/wiki/${urlSlug}`

    links.push({ url, title })
  })

  // Sort by title
  links.sort((a, b) => a.title.localeCompare(b.title))

  // Write to bin/wiki-links.js
  const output = `export const wikiLinks = [
${links.map((link, index) => `  {
    url: '${link.url}',
    title: '${link.title.replace(/'/g, "\\'")}'
  }${index < links.length - 1 ? ',' : ''}`).join('\n')}
]
`
  const outputPath = path.join(__dirname, 'wiki-links.js')
  fs.writeFileSync(outputPath, output)

  // Clean up temp dir
  exec(`rm -rf ${tempDir}`, (error) => {
    if (error) {
      console.error(`Error cleaning up: ${error}`)
    }
  })

  console.log(`Wiki links exported to ${outputPath}`)
})
