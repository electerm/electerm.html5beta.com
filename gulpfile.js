
const
  gulp = require('gulp')
const watch = require('gulp-watch')

const { exec } = require('shelljs')

/**
 * multi language support
 */

const { resolve } = require('path')

gulp.task('watch-prod', function () {
  watch(require('path').resolve(__dirname, 'data/electerm-github-release.json'), function () {
    console.log('build triggered')
    exec(resolve(__dirname, 'bin/build'))
  })
})

gulp.task('default', ['watch-prod'])
