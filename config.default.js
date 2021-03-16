// local setting
const config = {
  port: 7502,
  siteName: 'electerm'
}

try {
  const local = require('./config')
  Object.assign(config, local)
} catch (e) {
  console.log('no config.js but it ok')
}

module.exports = config
