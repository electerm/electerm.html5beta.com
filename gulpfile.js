

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
,spawn = require('cross-spawn')

let {exec} = require('shelljs')

/**
 * multi language support
 */

const fs = require('fs')
const {resolve} = require('path')

let
cssFolder = __dirname + '/res/css'
,jsFolder = __dirname + '/res/js'
,views = __dirname + '/views'
,stylusOptions = {
  compress: true
}
,uglyOptions = {

}

let version = ''
try {
  let data = require('./data/electerm-github-release.json')
  version = data.release.tag_name
} catch(e) {
  console.log('no ./data/electerm-github-release.json')
}
console.log('version:', version)

gulp.task('stylus', function() {

  gulp.src(cssFolder + '/*.styl')
    .pipe(plumber())
    .pipe(stylus(stylusOptions))
    .pipe(gulp.dest(cssFolder))

})

gulp.task('pug', function() {
  gulp.src(views + '/*.pug')
    .pipe(plumber())
    .pipe(pug({
      locals: config
    }))
    .pipe(gulp.dest(__dirname))

})

gulp.task('version', function() {
  fs.writeFileSync('./version.html', version)
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

gulp.task('watch-prod',  function () {
  watch(__dirname + '/data/*.json', function() {
    exec('./update')
  })
})

gulp.task('default', ['watch'])
gulp.task('dist', function() {
  runSequence('stylus', 'version')
})
gulp.task('build', function() {
  config.host = '//localhost:' + config.port
  runSequence('stylus', 'ugly', 'pug')
})