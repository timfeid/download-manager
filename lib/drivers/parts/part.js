'use strict'

var axios = require('axios')
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
  this.download.events.on('error', this.cleanup)
  this.start()
}

Part.prototype.cleanup = function () {
  fs.exists(this.file, (exists) => {
    if (exists) {
      fs.unlink(this.file, (err) => {
        if (err) {
          this.download.error(err)
        }
      })
    }
  })
}

Part.prototype.start = function () {
  this.request()
    .then(res => {
      res.data.on('end', this.complete.bind(this))
      res.data.on('data', this.progress.bind(this))
      res.data.on('error', (e) => {
        console.log(e)
      })
      res.data.pipe(fs.createWriteStream(this.file))
    })
    .catch(err => {
      console.log(err)
    })
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
  const opts = {
    method: 'get',
    responseType: 'stream',
    url: this.download.url,
    headers: {
      Cookie: typeof this.download.site.config.cookies === 'function' ? this.download.site.config.cookies() : '',
      Range: [
        'bytes=',
        this.from,
        '-',
        this.to
      ].join('')
    }
  }

  return axios(opts)
}

module.exports = Part
