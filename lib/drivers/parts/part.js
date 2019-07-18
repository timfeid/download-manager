'use strict'

var axios = require('axios')
  , fs = require('fs')
  , CancelToken = require('axios').CancelToken

var Part = function (number, download, PARTS) {
  this.cancel = null
  this.stream = null
  this.canceled = false
  this.totalBytes = Math.floor(download.contentLength / PARTS)
  this.download = download
  this.downloaded = 0
  this.number = number
  this.file = download.tempFile + '.part' + number
  this.from = number === 1 ? 0 : (this.totalBytes * (number - 1)) + 1
  this.to = number === PARTS ?
    download.contentLength : this.totalBytes * number

  this.download.events.trigger('part.created', this)
  this.download.events.on('error', this.cleanup.bind(this))
  this.start()
}

Part.prototype.cleanup = function () {
  if (this.stream) {
    this.stream.end()
  }
  if (this.cancel) {
    this.cancel()
  }
  if (fs.existsSync(this.file)) {
    fs.unlinkSync(this.file)
  }
}

Part.prototype.start = function () {
  this.stream = fs.createWriteStream(this.file)
  this.request()
    .then(res => {
      res.data.on('end', this.complete.bind(this))
      res.data.on('data', this.progress.bind(this))
      res.data.on('error', (e) => {
        console.log(e)
      })
      res.data.pipe(this.stream)
    })
    .catch(err => {
      console.log(err)
    })
}

Part.prototype.complete = function () {
  this.cancel = null
  if (!this.canceled) {
    this.download.events.trigger('part.complete', this)
  }
}

Part.prototype.progress = function (chunk) {
  this.downloaded += chunk.length
  this.download.events.trigger('part.progress', this)
  this.download.progress(chunk.length)
}

Part.prototype.request = function () {
  let cancel
  const opts = {
    cancelToken: new CancelToken(c => cancel = c),
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

  this.cancel = cancel

  return axios(opts)
}

module.exports = Part
