'use strict'

var manager = {}
var Events = require('./events')
var Download = require('./download');

(function (api) {
  var downloads = []

  var events = new Events()

  var addDownloadEvent = function (download, event) {
    download.on(event, function () {
      var args = arguments.length === 1 ?
        [arguments[0]] : Array.apply(null, arguments)
      events.trigger('download.' + event, args)
    })
  }

  var addDownloadEvents = function (download) {
    var events = [
      'start',
      'init',
      'progress',
      'headers'
    ]

    events.forEach(function (event) {
      addDownloadEvent(download, event)
    })
  }

  api.add = function (url) {
    var download = new Download(url)
    events.trigger('add', download)

    addDownloadEvents(download)
    downloads.push(download)

    return download
  }

  api.on = function (event, callback) {
    events.on(event, callback)
  }
})(manager)

module.exports = manager
