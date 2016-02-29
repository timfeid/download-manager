'use strict'

var request = require('request')
  , fs = require('fs')

var Part = function (number, download, PARTS) {
  this.totalBytes = Math.floor(download.contentLength / PARTS)
  this.download = download
  this.downloaded = 0
  this.number = number
  this.file = download.tempFile + '.part' + number
  this.from = number === 1 ? 0 : (this.totalBytes * (number - 1)) + 1
  this.to = number === PARTS ?
    download.contentLength : this.totalBytes * number

  this.download.events.trigger('part.created', this)
  this.start()
}

Part.prototype.cleanup = function () {
  fs.unlink(this.file)
}

Part.prototype.start = function () {
  this.request()
    .on('end', this.complete.bind(this))
    .on('data', this.progress.bind(this))
    .pipe(fs.createWriteStream(this.file))
}

Part.prototype.complete = function () {
  this.download.events.trigger('part.complete', this)
}

Part.prototype.progress = function (chunk) {
  this.downloaded += chunk.length
  this.download.events.trigger('part.progress', this)
  this.download.progress(chunk.length)
}

Part.prototype.request = function () {
  return request.get({
    url: this.download.url,
    // timeout: 120,
    jar: this.download.site.cookieJar,
    headers: {
      Range: [
        'bytes=',
        this.from,
        '-',
        this.to
      ].join('')
    }
  })
}

module.exports = Part
