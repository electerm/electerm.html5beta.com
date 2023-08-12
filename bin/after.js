/**
 * build html with pug template
 */

import { cwd, exe } from './common.js'
import { resolve } from 'path'

async function build () {
  const fo = resolve(cwd, '../electerm')
  await exe(`cd ${fo} && git checkout gh-pages && cp -rf ../electerm.html5beta.com/data ./ && cp ../electerm.html5beta.com/public/*.html ./ && git add --all && git commit -m 'update' && git push && git push gt gh-pages`)
  await exe(`cd ${fo} && git fetch origin master:master && git push gt master:master`)
}

build()
