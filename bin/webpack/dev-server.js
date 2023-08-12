import logger from 'morgan'
import { viewPath, env, staticPath } from '../common.js'
import data from '../data.js'
import express from 'express'

const devPort = env.SERVER_DEV_PORT || 6068
const host = env.SERVER_HOST || '127.0.0.1'
const h = `http://${host}:${devPort}`

function handleIndex (req, res) {
  const lang = data.langs[2]
  const view = 'index'
  res.render(view, {
    ...data,
    host: h,
    url: h,
    cssUrl: h + '/' + view + '.bundle.css',
    jsUrl: h + '/' + view + '.bundle.js',
    langCode: lang.langCode,
    lang: lang.lang,
    desc: lang.lang.lang.app.desc
  })
}

export default {
  allowedHosts: 'all',
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  },
  historyApiFallback: true,
  hot: true,
  host,
  port: devPort,
  client: {
    logging: 'log'
  },
  onBeforeSetupMiddleware: function (devServer) {
    const {
      app
    } = devServer
    app.use(
      logger('tiny')
    )
    app.use(express.json())
    app.use(express.urlencoded())
    app.use(express.static(staticPath))
    app.set('views', viewPath)
    app.set('view engine', 'pug')
    app.get('/', handleIndex)
  }
}
