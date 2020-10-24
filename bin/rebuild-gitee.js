/**
 * rebuild gitee pages after code push
 */
require('dotenv').config()

const Gitee = require('gitee-client').default

function run () {
  const gc = new Gitee(
    process.env.GITEE_TOKEN
  )
  gc.post('https://gitee.com/api/v5/repos/github-zxdong262/electerm/pages/builds')
    .catch(console.log)
    .then(console.log)
}

module.exports = run
