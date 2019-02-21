'use strict'

var Events = require('./events')
  , Download = require('./download')
  , defaultConfig = require('../config/config')
  , helpers = require('./helpers')

var Manager = function (config) {
  config = {...defaultConfig, ...config}
  this.config = config
  this.events = new Events()
  this.downloads = []
  this.paths = {
    temp: config.dirs.temp,
    download: config.dirs.download
  }
  this.on('download.complete', this.onDownloadComplete.bind(this))
  this.on('download.error', this.onDownloadError.bind(this))
}

Manager.prototype._addDownloadEvent = function (download, event) {
  download.on(event, function () {
    var args = arguments.length === 1 ?
      [arguments[0]] : Array.apply(null, arguments)
    this.events.trigger('download.' + event, args)
  }.bind(this))
}

Manager.prototype._addDownloadEvents = function (download) {
  var events = [
    'start',
    'init',
    'progress',
    'headers',
    'error',
    'complete',
  ]

  events.forEach(function (event) {
    this._addDownloadEvent(download, event)
  }.bind(this))
}

Manager.prototype.startNextDownload = function () {
  const downloadingCount = this.downloads.filter(download => download.started).length
  if (!this.config.maxDownloads || this.config.maxDownloads <= 0 || downloadingCount < this.config.maxDownloads) {
    let nextDownload = this.downloads.find(download => !download.started)
    if (nextDownload) {
      nextDownload.start()
      this.startNextDownload()
    }
  }
}

Manager.prototype.onDownloadComplete = function (download) {
  const i = this.downloads.findIndex(d => download.url === d.url)
  if (i !== -1) {
    this.downloads.splice(i, 1)
    if (this.downloads.length > 0) {
      this.startNextDownload()
    }
  }
}

Manager.prototype.onDownloadError = function (error) {
  const download = error.download
  const i = this.downloads.findIndex(d => download.url === d.url)
  if (i !== -1) {
    this.downloads.splice(i, 1)
    if (this.downloads.length > 0) {
      this.startNextDownload()
    }
  }
}

Manager.prototype.filePath = function (path, file) {
  return helpers.filePath(this.findDir(path), file)
}

Manager.prototype.setPath = function (which, dir) {
  helpers.writable(dir)
  this.paths[which] = dir
  return this
}

Manager.prototype.findDir = function (which) {
  var dir = this.paths[which]
  helpers.writable(dir, which + ' dir')

  return dir

}

Manager.prototype.download = function (url) {
  return new Promise((resolve, reject) => {
    this.add(url).on('complete', function (download) {
      resolve(download)
    }).on('error', function (error) {
      reject(error)
    })
  })
}

Manager.prototype.add = function (url) {
  var download = new Download(url, this.paths.temp, this.paths.download)

  this._addDownloadEvents(download)
  this.downloads.push(download)
  this.events.trigger('add', download)
  this.startNextDownload()

  return download
}

Manager.prototype.on = function (event, callback) {
  this.events.on(event, callback)

  return this
}

module.exports = Manager
