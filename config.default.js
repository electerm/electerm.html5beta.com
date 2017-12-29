//local setting
let config = {
  port: 7502,
  siteName: 'electerm'
}

try {
  let local = require('./config')
  Object.assign(config, local)
} catch (e) {
  console.log('no config.js but it ok')
}

module.exports = config
