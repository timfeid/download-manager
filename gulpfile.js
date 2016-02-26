'use strict'

var gulp = require('gulp')
var eslint = require('gulp-eslint')
var notify = require('gulp-notify')

gulp.task('lint', function () {
  return gulp.src(['**/*.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.result(function (result) {
      if (result.errorCount === 0) {
        return
      }
    }))
    .pipe(notify(function (file) {
      if (file.eslint.errorCount === 0) {
        return
      }

      var message = [
        file.eslint.messages[0].message,
        ' at ',
        file.eslint.messages[0].line,
        ':',
        file.eslint.messages[0].column
      ].join('')

      return {
        title: file.eslint.filePath,
        message: message
      }
    }))
})

gulp.task('watch', function () {
  gulp.watch('**/*.js', ['lint'])
})
