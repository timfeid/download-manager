'use strict'

var request = require('request')
  , config = require('./../config/config')
  , helpers = require('./helpers')
  , Events = require('./events')
  , fs = require('fs')

var findConfig = function (url) {
  var match = null
  config.sites.forEach(function (siteConfig) {
    if (url.match(siteConfig.match)) {
      match = siteConfig
    }
  })

  return match
}

var buildConfig = function (url) {
  var parsed = helpers.parseUrl(url)

  return {
    match: new RegExp('/' + parsed.hostname.replace('.', '\\.') + '/')
  }
}

var Site = function (url) {
  this.config = this.findConfig(url)
  this.cookieJar = request.jar()
  this.authed = false
  this.authing = false
  this.cookies = null
  this.events = new Events()
  this.on('authenticated', this.authenticated.bind(this))
}

Site.prototype.findConfig = function (url) {
  var match = findConfig(url)

  if (match === null) {
    match = buildConfig(url)
  }

  return match
}

Site.prototype.matches = function (url) {
  return url.match(this.config.match) !== null
}

Site.prototype.headers = function (url) {
  this.cookieJar.setCookie(request.cookie(this.cookies), url)

  return request.head({
    url: url,
    jar: this.cookieJar
  })
}

Site.prototype.authenticated = function (response) {
  this.authed = true
  this.authing = false
}

Site.prototype.on = function (event, callback) {
  this.events.on(event, callback)
  return this
}

Site.prototype.login = function () {
  return request({
    url: this.config.authenticate.url,
    method: this.config.authenticate.method.toLowerCase(),
    form: this.config.authenticate.form,
    jar: this.cookieJar
  })
}

Site.prototype.init = function (callback) {
  if (typeof this.config.authenticate === 'undefined' ||
      this.authed) {
    return callback(this)
  }

  this.on('authenticated', callback)

  if (!this.authing) {
    this.authing = true
    this.login()
      .on('end', function () {
        this.cookies = this.cookieJar.getCookieString(this.config.authenticate.url)
        this.events.trigger('authenticated', this)
      }.bind(this))
  }
}

module.exports = Site
