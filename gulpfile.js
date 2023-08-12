import gulp from 'gulp'
import watch from 'gulp-watch'
import { exe, cwd } from './bin/common.js'
import { resolve } from 'path'
/**
 * multi language support
 */

gulp.task('watch-prod', function () {
  watch(resolve(cwd, 'data/electerm-github-release.json'), function () {
    console.log('build triggered')
    exe(resolve(cwd, 'bin/build'))
  })
})

gulp.task('default', ['watch-prod'])
