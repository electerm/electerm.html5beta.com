/*!
 * TEST SERVER
**/

const config = require('./config.default')
const Koa = require('koa')
const serve = require('koa-static')
const oneYear = 1000 * 60 * 60 * 24 * 365
const app = new Koa()

app.use(serve(__dirname, {
  maxAge: oneYear
}))

//start
app.listen(config.port, function() {
  console.log(new Date() + ' ' + config.siteName + ' runs on port ' + config.port)
})


