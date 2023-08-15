import fs from 'fs'
import { exec } from 'child_process'
import { resolve } from 'path'
import { cwd } from './bin/common.js'

const filePath = resolve(cwd, 'data/electerm-github-release.json') // Replace with the actual path to the file
const commandToRun = 'npm run b' // Replace with the command you want to run

// Watch for changes in the file
fs.watchFile(filePath, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log('File has changed. Running command...')
    executeCommand(commandToRun)
  }
})

// Execute the specified command
function executeCommand (command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
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