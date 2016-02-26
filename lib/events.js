'use strict'

var events = {}

var EventExistsException = function (event) {
  this.name = 'Event already exist'
  this.message = event
}

events.events = function () {
  this.events = {}

  return this
}

events.events.prototype.add = function (event) {
  if (this.exists(event)) {
    throw new EventExistsException(event)
  }

  this.events[event] = []
}

events.events.prototype.trigger = function (event, args) {
  if (!this.exists(event)) {
    return
  }

  args = Object.prototype.toString.call(args) === '[object Array]' ?
    args : [args]
  this.events[event].forEach(function (callback) {
    callback.apply(null, args)
  })
}

events.events.prototype.exists = function (event) {
  return typeof this.events[event] !== 'undefined'
}

events.events.prototype.on = function (event, callback) {
  if (!this.exists(event)) {
    this.add(event)
  }

  this.events[event].push(callback)
}

module.exports = events.events
