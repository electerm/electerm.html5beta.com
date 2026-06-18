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

// Override locale and page URLs to use dev host
data.langs = data.langs.map(l => ({
  ...l,
  url: l.slug === '' ? h : h + '/' + l.slug + '/'
}))

function handleLocale (req, res) {
  const slug = req.params.param || req.params.lang
  const langData = data.langs.find(l => l.slug === slug)
  if (!langData) {
    res.status(404).send('Language not found')
    return
  }
  res.render('index', {
    ...data,
    host: h,
    url: h + '/' + slug + '/',
    dev: true,
    cssUrl: h + '/index.bundle.css',
    jsUrl: '/src/views/index.jsx',
    langCode: langData.langCode,
    lang: langData.lang,
    desc: langData.lang.lang.desc
  })
}

function handlePage (req, res) {
  const page = req.params.param || req.params.page
  const { langCode, lang } = data.langs[2]
  res.render(page, {
    ...data,
    host: h,
    url: h + '/' + page + '/',
    dev: true,
    cssUrl: h + '/index.bundle.css',
    jsUrl: '/src/views/index.jsx',
    langCode,
    lang,
    desc: lang.lang.desc
  })
}

function handleIndex (req, res) {
  const { langCode, lang } = data.langs[2]
  res.render('index', {
    ...data,
    host: h,
    url: h,
    dev: true,
    cssUrl: h + '/index.bundle.css',
    jsUrl: '/src/views/index.jsx',
    langCode,
    lang,
    desc: lang.lang.desc
  })
}

function handleVideo (req, res) {
  const { langCode, lang } = data.langs[2]
  const videoSlug = req.params.videoSlug
  const video = data.videos.find(v => v.videoSlug === videoSlug)
  if (!video) {
    res.status(404).send('Video not found')
    return
  }
  res.render('video', {
    ...data,
    host: h,
    url: h,
    dev: true,
    cssUrl: h + '/index.bundle.css',
    jsUrl: '/src/views/index.jsx',
    langCode,
    lang,
    desc: video.description,
    video
  })
}

function handleVideosIndex (req, res) {
  const { langCode, lang } = data.langs[2]
  res.render('videos', {
    ...data,
    host: h,
    url: h + '/videos',
    dev: true,
    cssUrl: h + '/index.bundle.css',
    jsUrl: '/src/views/index.jsx',
    langCode,
    lang,
    desc: lang.lang.desc,
    videos: data.videos
  })
}

async function createServer () {
  const app = express()

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

  app.use(vite.middlewares)

  app.get('/api/country', (req, res) => {
    const country = (req.headers['cf-ipcountry'] || 'BG').toUpperCase()
    res.json({ country })
  })

  app.get('/', handleIndex)
  app.get('/videos', handleVideosIndex)
  app.get('/videos/:videoSlug', handleVideo)

  // Catch-all for /:something/ routes
  app.get('/:param/', (req, res, next) => {
    const param = req.params.param
    const langData = data.langs.find(l => l.slug === param)
    if (langData) {
      return handleLocale(req, res)
    }
    // Check if it's a known page
    if (data.pages.includes(param) || param === 'deb') {
      return handlePage(req, res)
    }
    res.status(404).send('Not found')
  })

  app.listen(devPort, host, () => {
    console.log(`server started at ${h}`)
  })
}

createServer()
