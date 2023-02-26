/**
 * build html with pug template
 */

const pug = require('pug')
const fs = require('fs')
const { resolve } = require('path')
const copy = require('json-deep-copy')
const stylus = require('stylus')
const { exec, cd } = require('shelljs')
const giteeBuild = require('./rebuild-gitee')
const urlFix = require('../bin/url-fix')

function download () {
  const downloadFolder = resolve(__dirname, '../releases')

  let assets = []
  let version = ''
  let releaseDate = ''
  try {
    const data = require('../data/electerm-github-release.json')
    assets = data.release.assets
    version = data.release.tag_name
    releaseDate = data.release.published_at
  } catch (e) {
    console.log('no ../data/electerm-github-release.json')
  }
  console.log('version:', version)
  console.log('releaseDate:', releaseDate)
  cd(downloadFolder)
  for (const ast of assets) {
    exec(`wget ${ast.browser_download_url}`)
  }
}

download()