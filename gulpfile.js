

let
gulp = require('gulp')
,watch = require('gulp-watch')

let {exec} = require('shelljs')

/**
 * multi language support
 */

const {resolve} = require('path')

gulp.task('watch-prod',  function () {
  watch(__dirname + '/data/electerm-github-release.json', function() {
    console.log('build triggered')
    exec(resolve(__dirname, 'bin/build'))
  })
})

gulp.task('default', ['watch-prod'])
