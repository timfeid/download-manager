'use strict'

var Part = require('./parts/part')
  , concat = require('concat-files')

var parts = function (PARTS) {
  var parts = {}

  parts.Driver = function (download) {
    this.parts = []
    this.totalCompleted = 0
    this.download = download
    this.createEvents()
    this.createParts()
  }

  parts.Driver.prototype.createEvents = function () {
    this.download.on('part.complete', this.partCompleted.bind(this))
  }

  parts.Driver.prototype.partCompleted = function () {
    if (++this.totalCompleted === PARTS) {
      this.join(this.parts.map(function (part) {
        return part.file
      }))
    }
  }

  parts.Driver.prototype.join = function (files) {
    var callback = this.cleanup.bind(this)
    concat(files, this.download.file, callback)
  }

  parts.Driver.prototype.cleanup = function () {
    this.parts.forEach(function (part) {
      part.cleanup()
    })

    this.complete()
  }

  parts.Driver.prototype.complete = function () {
    this.download.complete()
  }

  parts.Driver.prototype.createParts = function () {
    var number = 1
    for (number; number <= PARTS; number++) {
      this.parts.push(new Part(number, this.download, PARTS))
    }
  }

  parts.valid = function (response) {
    return response.headers['accept-ranges'] === 'bytes'
  }

  return parts
}

module.exports = parts
