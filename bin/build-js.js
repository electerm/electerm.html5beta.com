import { exe } from './common.js'

export async function main () {
  await exe(
    'NODE_ENV=production DESC="html5beta.com" TITLE="html5beta.com" LINK="https://html5beta.com" ENTRY_NAME=index ENTRY=src/views/index.jsx OUT=public LIB_NAME=Index node_modules/.bin/vite build --config bin/vite/conf.js'
  )
}

main()
