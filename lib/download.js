'use strict'

var Events = require('./events')
  , sites = require('./sites')
  , config = require('./../config/config')
  , helpers = require('./helpers')

var DEFAULT_DRIVER = config.defaultDriver

var Download = function (url, tempDir, downloadDir) {
  this.url = url
  this.site = sites.find(url)
  this.file = null
  this.events = new Events()
  this.driver = null
  this.tempFile = helpers.filePath(tempDir, helpers.randomString())
  this.downloadDir = downloadDir
  this.downloaded = 0
  this.contentLength = 0

  this.bindEvents()

  this.start()

  return this
}

Download.prototype.filePath = function (headers) {
  return helpers.filePath(this.downloadDir, this.createFileName(headers))
}

Download.prototype.error = function (error) {
  return this.events.trigger('error', error)
}

Download.prototype.bindEvents = function () {
  this.on('start', this.site.init.bind(this.site, this.init.bind(this)))
}

Download.prototype.on = function (event, callback) {
  this.events.on(event, callback)
  return this
}

Download.prototype.start = function () {
  this.events.trigger('start', this)
  return this
}

Download.prototype.init = function (site) {
  this.events.trigger('init', this)
  site.headers(this.url)
    .on('response', this.headers.bind(this))
}

Download.prototype.createFileName = function (headers) {
  var disposition
    , matches
    , dirs

  if ((disposition = headers['content-disposition'])) {
    matches = disposition.match(/filename="([^"]+)"/)
    if (typeof matches[1] !== 'undefined') {
      return matches[1]
    }
  }

  dirs = helpers.parseUrl(this.url)
    .pathname.split('/')

  return dirs[dirs.length-1]
}


Download.prototype.headers = function (response) {
  var Driver = this.findDriver(response)
  this.file = this.filePath(response.headers)
  this.contentLength = parseInt(response.headers['content-length'], 10)
  this.events.trigger('headers', this)

  this.driver = new Driver(this)
  this.events.trigger('driver', this)
}

Download.prototype.findDriver = function (response) {
  var index = 0
    , driver

  for (; index < config.drivers.length; index++) {
    driver = config.drivers[index]
    if (driver.valid(response)) {
      return driver.Driver
    }
  }

  return DEFAULT_DRIVER.Driver
}

Download.prototype.progress = function (bytesDownloaded) {
  this.downloaded += bytesDownloaded
  this.events.trigger('progress', [this, bytesDownloaded])
}

Download.prototype.complete = function () {
  this.events.trigger('complete', this)
}

module.exports = Download
