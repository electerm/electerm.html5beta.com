import logger from 'morgan'
import { viewPath, env, staticPath } from '../common.js'
import data from '../data.js'
import express from 'express'
import { createServer as createViteServer } from 'vite'
import conf from './conf.js'

const devPort = env.SERVER_DEV_PORT || 6068
const host = env.SERVER_HOST || '127.0.0.1'
const h = `http://${host}:${devPort}`
global.viteInst = null

function handleIndex (req, res) {
  const lang = data.langs[2]
  const view = req.params?.page || 'index'
  res.render(view, {
    ...data,
    host: h,
    url: h,
    dev: true,
    cssUrl: h + '/index.bundle.css',
    jsUrl: '/src/views/index.jsx',
    langCode: lang.langCode,
    lang: lang.lang,
    desc: lang.lang.lang.app.desc
  })
}

async function createServer () {
  const app = express()

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    ...conf,
    server: {
      middlewareMode: true
    },
    appType: 'custom'
  })
  global.viteInst = vite
  app.use(
    logger('tiny')
  )
  app.use(express.json())
  app.use(express.urlencoded({
    extended: true
  }))
  app.use(express.static(staticPath))
  app.set('views', viewPath)
  app.set('view engine', 'pug')

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  app.use(vite.middlewares)
  app.get('/', handleIndex)
  app.get('/:page', handleIndex)

  app.listen(devPort, host, () => {
    console.log(`server started at ${h}`)
  })
}

createServer()
