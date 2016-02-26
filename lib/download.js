'use strict'

var Events = require('./events')
  , sites = require('./sites')
  , config = require('./../config/config')
  , DEFAULT_DRIVER = config.defaultDriver
  , helpers = require('./helpers')

var randomFileName = function () {
  return '_' + Math.random().toString(36).replace(/[^a-z]+/g, '')
}

var Download = function (url) {
  this.url = url
  this.events = new Events()
  this.site = sites.find(url)
  this.contentLength = 0
  this.downloaded = 0
  this.file = null
  this.tempFile = config.tempDir + randomFileName()
  this.driver = null

  this.bindEvents()

  return this
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
    .on('response', this.handleHeaders.bind(this))
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

  return dirs[dirs.length-1];
}

Download.prototype.handleHeaders = function (response) {
  var Driver

  this.file = config.downloadDir + this.createFileName(response.headers)
  this.contentLength = parseInt(response.headers['content-length'], 10)
  Driver = this.findDriver(response)

  this.events.trigger('headers', this)
  this.driver = new Driver(this)
}

Download.prototype.findDriver = function (response) {
  var index = 0
  for (; index < config.drivers.length; index++) {
    var driver = config.drivers[index]
    if (driver.valid(response)) {
      return driver.Driver
    }
  }

  return DEFAULT_DRIVER.Driver
}

Download.prototype.progress = function (bytesDownloaded) {
  this.downloaded += bytesDownloaded
  this.events.trigger('progress', this)
}

Download.prototype.complete = function () {
  this.events.trigger('complete', this)
}

module.exports = Download
