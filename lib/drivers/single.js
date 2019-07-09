'use strict'

var request = require('request')
  , fs = require('fs')

var valid = function () {
  return true
}

var Driver = function (download) {
  this.download = download
  // this.start()
}

Driver.prototype.request = function () {
  return request.get({
    url: this.download.url,
    jar: this.download.site.cookieJar
  })
}

Driver.prototype.start = function () {
  this.request()
    .on('end', this.complete.bind(this))
    .on('data', this.progress.bind(this))
    .on('error', this.download.error.bind(this.download))
    .pipe(fs.createWriteStream(this.download.file))
}

Driver.prototype.complete = function () {
  this.download.events.trigger('complete', this.download)
}

Driver.prototype.progress = function (chunk) {
  this.download.progress(chunk.length)
}

module.exports = {
  Driver: Driver,
  valid: valid
}