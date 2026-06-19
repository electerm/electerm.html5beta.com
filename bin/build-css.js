import stylus from 'stylus'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { cwd } from './common.js'

function compileStylus (compress = true) {
  const files = [
    'src/css/basic.styl',
    'src/css/home.styl'
  ]
  let css = ''
  for (const file of files) {
    const filePath = resolve(cwd, file)
    const content = readFileSync(filePath, 'utf-8')
    const compiled = stylus(content)
      .set('filename', filePath)
      .set('compress', compress)
      .render()
    css += compiled + '\n'
  }
  return css
}

async function main () {
  const outDir = resolve(cwd, 'public')
  mkdirSync(outDir, { recursive: true })

  console.log('Building CSS...')
  const css = compileStylus(true)
  const outPath = resolve(outDir, 'index.bundle.css')
  writeFileSync(outPath, css)
  console.log(`✅ CSS built: ${outPath}`)
}

main().catch(err => {
  console.error('CSS build failed:', err)
  process.exit(1)
})
