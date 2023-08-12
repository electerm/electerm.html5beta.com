import { config as conf } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { exec } from 'child_process'

conf()

export const cwd = process.cwd()
export const env = process.env
export const isProd = env.NODE_ENV === 'production'
const packPath = resolve(cwd, 'package.json')
const releasePath = resolve(cwd, 'data/electerm-github-release.json')
export const releaseData = JSON.parse(readFileSync(releasePath, 'utf-8'))
export const pack = JSON.parse(readFileSync(packPath, 'utf-8'))
export const version = pack.version
export const viewPath = resolve(cwd, 'src/views')
export const staticPath = resolve(cwd, 'src/static')
export function cap (inputString) {
  if (typeof inputString !== 'string' || inputString.length === 0) {
    return inputString
  }
  const words = inputString.split('-')
  const capitalizedString = words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1)
  }).join('')
  return capitalizedString
}

export function exe (command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout.trim())
    })
  })
}
