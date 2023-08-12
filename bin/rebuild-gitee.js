/**
 * rebuild gitee pages after code push
 */

import { config } from 'dotenv'
import Gitee from 'gitee-client'

config()

async function run () {
  const gc = new Gitee(
    process.env.GITEE_TOKEN
  )
  await gc.post('https://gitee.com/api/v5/repos/github-zxdong262/electerm/pages/builds')
    .catch(console.log)
    .then(console.log)
}

run()
