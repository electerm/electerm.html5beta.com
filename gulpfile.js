

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

let
cssFolder = __dirname + '/res/css'
,jsFolder = __dirname + '/res/js'
,views = __dirname + '/views'
,stylusOptions = {
  compress: true
}
,uglyOptions = {

}

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

gulp.task('pug', function() {

  gulp.src(views + '/*.pug')
    .pipe(plumber())
    .pipe(pug({
      locals: config
    }))
    .pipe(gulp.dest(__dirname))

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




gulp.task('default', ['watch'])
gulp.task('dist', function() {
  config.host = '//electerm.html5beta.com'
  runSequence('stylus', 'ugly', 'pug')
})
gulp.task('build', function() {
  config.host = '//localhost:' + config.port
  runSequence('stylus', 'ugly', 'pug')
})