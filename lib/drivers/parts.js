'use strict'

var Part = require('./parts/part')
  , concat = require('concat-files')

var parts = function (PARTS) {
  var parts = {}

  var Driver = function (download) {
    this.parts = []
    this.totalCompleted = 0
    this.download = download
    this.createEvents()
    this.createParts()
  }

  Driver.prototype.createEvents = function () {
    this.download.on('part.complete', this.partCompleted.bind(this))
  }

  Driver.prototype.partCompleted = function () {
    if (++this.totalCompleted === PARTS) {
      this.join(this.parts.map(function (part) {
        return part.file
      }))
    }
  }

  Driver.prototype.join = function (files) {
    var callback = this.cleanup.bind(this)
    concat(files, this.download.file, callback)
  }

  Driver.prototype.cleanup = function () {
    this.parts.forEach(function (part) {
      part.cleanup()
    })

    this.complete()
  }

  Driver.prototype.complete = function () {
    this.download.complete()
  }

  Driver.prototype.createParts = function () {
    var number = 1
    for (number; number <= PARTS; number++) {
      this.parts.push(new Part(number, this.download, PARTS))
    }
  }

  var valid = function (response) {
    return response.headers['accept-ranges'] === 'bytes'
  }

  parts.valid = valid
  parts.Driver = Driver

  return parts
}

module.exports = parts
