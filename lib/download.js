'use strict'

var Events = require('./events')
  , sites = require('./sites')
  , config = require('./../config/config')
  , helpers = require('./helpers')
  , fs = require('fs')

var DEFAULT_DRIVER = config.defaultDriver

var randomFileName = function () {
  return '_' + Math.random().toString(36).replace(/[^a-z]+/g, '')
}

var Download = function (url) {
  this.url = url
  this.site = sites.find(url)
  this.file = null
  this.events = new Events()
  this.driver = null
  this.tempFile = this.tempPath()
  this.downloaded = 0
  this.contentLength = 0

  this.bindEvents()

  return this
}

Download.prototype.findDir = function (which) {
  var option = helpers.option(which + '-dir')
    , dir = (typeof option === 'string') ? option : config.dirs[which]

  helpers.writable(dir, which + ' dir')

  return dir;

};

Download.prototype.filePath = function (headers) {
  return helpers.filePath(this.findDir('download'), this.createFileName(headers))
}

Download.prototype.tempPath = function () {
  return helpers.filePath(this.findDir('temp'), randomFileName())
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
  this.events.trigger('progress', this)
}

Download.prototype.complete = function () {
  this.events.trigger('complete', this)
}

module.exports = Download
