

let
ugly = require('gulp-uglify')
,gulp = require('gulp')
,watch = require('gulp-watch')
,plumber = require('gulp-plumber')
,newer = require('gulp-newer')
,stylus = require('gulp-stylus')
,pug = require('gulp-pug')
,concat = require('gulp-concat')
,rename = require('gulp-rename')
,runSequence = require('run-sequence')
,_ = require('lodash')
,path = require('path')
,fs = require('fs')
,spawn = require('cross-spawn')

let {exec} = require('shelljs')

let
cssFolder = __dirname + '/res/css'
,jsFolder = __dirname + '/res/js'
,views = __dirname + '/views'
,stylusOptions = {
  compress: true
}
,uglyOptions = {

}

let assets = []
let version = ''
try {
  let data = require('./data/electerm-github-release.json')
  assets = data.release.assets
  version = data.release.tag_name
} catch(e) {
  console.log('no ./data/electerm-github-release.json')
}
console.log('version:', version)

gulp.task('stylus', function() {

  gulp.src(cssFolder + '/*.styl')
    /*
    .pipe(newer({
      dest: cssFolder
      ,map: function(path) {
        return path.replace(/\.styl$/, '.css')
      }
    }))
    */
    .pipe(plumber())
    .pipe(stylus(stylusOptions))
    .pipe(gulp.dest(cssFolder))

})


gulp.task('ugly', function() {

  gulp.src(jsFolder + '/*.js')
    .pipe(newer({
      dest: jsFolder
      ,map: function(path) {
        return path.replace(/\.dev.js$/, '.min.js')
      }
    }))
    .pipe(plumber())
    .pipe(rename(function (path) {
      path.basename = path.basename.replace('.dev', '.min')
    }))
    .pipe(gulp.dest(jsFolder))
    .pipe(ugly(uglyOptions))
    .pipe(gulp.dest(jsFolder))

})

let config = require('./config.default')
let pack = require('./package.json')
config.assets = assets.reduce((prev, curr) => {
  if (curr.name.includes('win')) {
    prev.windows.items.push(curr)
  } else if (curr.name.includes('mac')) {
    prev.mac.items.push(curr)
  } else {
    if (curr.name.endsWith('.rpm')) {
      curr.desc = 'for Red Hat, Fedora...'
    } else if (curr.name.endsWith('.deb')) {
      curr.desc = 'for Debian, Ubuntu...'
    } else if (curr.name.endsWith('.gz')) {
      curr.desc = 'for all linux x86, just extract'
    }
    prev.linux.items.push(curr)
  }
  return prev
}, {
  linux: {
    name: 'linux x86 x64',
    items: []
  },
  mac: {
    name: 'mac os x64',
    items: []
  },
  windows: {
    name: 'windows 7/8/10 x86 x64',
    items: []
  }
})
console.log('config.assets.length:', Object.keys(config.assets).length)
gulp.task('pug', function() {

  gulp.src(views + '/*.pug')
    .pipe(plumber())
    .pipe(pug({
      locals: config
    }))
    .pipe(gulp.dest(__dirname))

})

gulp.task('version', function() {

  fs.writeFileSync('./version', version)

})

gulp.task('server', function (cb) {
  var runner = spawn(
    'node'
    ,['server']
    ,{
      stdio: 'inherit'
    }
  )

  runner.on('exit', function (code) {
    process.exit(code)
  })

  runner.on('error', function (err) {
    cb(err)
  })
})

gulp.task('watch',  function () {

  runSequence('server')
  watch([cssFolder + '/*.styl', cssFolder + '/parts/*.styl'], function() {
    runSequence('stylus')
  })

  watch(jsFolder, function() {
    runSequence('ugly')
  })

  watch([
      views + '/*.pug'
      ,views + '/parts/*.pug'
    ], function() {
      runSequence('pug')
    }
  )

})


gulp.task('watch-prod',  function () {

  watch(__dirname + '/data/*.json', function() {
    console.log('dfdf')
    exec('./update')
  })

})

gulp.task('default', ['watch'])
gulp.task('dist', function() {
  config.host = '//electerm.html5beta.com'
  runSequence('stylus', 'ugly', 'pug', 'version')
})
gulp.task('build', function() {
  config.host = '//localhost:' + config.port
  runSequence('stylus', 'ugly', 'pug')
})