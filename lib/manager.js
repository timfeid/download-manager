'use strict'

var Events = require('./events')
  , Download = require('./download')
  , config = require('../config/config')
  , helpers = require('./helpers')

var Manager = function () {
  this.events = new Events()
  this.downloads = []
  this.paths = {
    temp: config.dirs.temp,
    download: config.dirs.download
  }
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
    'headers'
  ]

  events.forEach(function (event) {
    this._addDownloadEvent(download, event)
  }.bind(this))
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

Manager.prototype.add = function (url) {
  var download = new Download(url, this.paths.temp, this.paths.download)

  this._addDownloadEvents(download)
  this.events.trigger('add', download)
  this.downloads.push(download)

  return download
}

Manager.prototype.on = function (event, callback) {
  this.events.on(event, callback)
}

module.exports = Manager
