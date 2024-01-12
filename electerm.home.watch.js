import fs from 'fs'
import { exec } from 'child_process'
import { resolve } from 'path'
import { cwd } from './bin/common.js'

const filePath = resolve(cwd, 'data/electerm-github-release.json') // Replace with the actual path to the file
const commandToRun = 'npm run b' // Replace with the command you want to run

function checkVersion () {
  try {
    const d = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const tag = d.release.name.toLowerCase()
    return d.action === 'published' &&
      !tag.includes('b') &&
      !tag.includes('a') &&
      d.release.assets &&
      d.release.assets.length > 0 &&
      d.release.body &&
      d.release.body.length > 10
  } catch (err) {
    console.error('Failed to load file:', err)
  }
  return false
}

// Watch for changes in the file
fs.watchFile(filePath, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log(new Date(), 'File has changed. Running command...')
    if (checkVersion()) {
      executeCommand(commandToRun)
    } else {
      console.log('it is beta, no need to do anything')
    }
  }
})

// Execute the specified command
function executeCommand (command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`)
      return
    }
    if (stderr) {
      console.error(`Command stderr: ${stderr}`)
      return
    }
    console.log(`Command output: ${stdout}`)
  })
}

console.log(`Watching file: ${filePath}`)
