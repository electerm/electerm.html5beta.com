

let
gulp = require('gulp')
,watch = require('gulp-watch')
,plumber = require('gulp-plumber')
,stylus = require('gulp-stylus')
,runSequence = require('run-sequence')
,_ = require('lodash')
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
  watch(__dirname + '/data/electerm-github-release.json', function() {
    console.log('build triggered')
    exec(resolve(__dirname, 'bin/build'))
  })
})

gulp.task('default', ['watch'])
gulp.task('dist', function() {
  runSequence('stylus', 'version')
})
gulp.task('build', function() {
  config.host = '//localhost:' + config.port
  runSequence('stylus', 'ugly')
})