import { exe } from './common.js'

export async function main () {
  await exe(
    'NODE_ENV=production DESC="html5beta.com" TITLE="html5beta.com" URL="https://html5beta.com" ENTRY_NAME=index ENTRY=src/views/index.js OUT=public LIB_NAME=Index node_modules/.bin/webpack --progress --config bin/webpack/webpack.config.js'
  )
}

main()
