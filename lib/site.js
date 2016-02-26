'use strict'

var request = require('request')
var config = require('./../config/config')
var helpers = require('./helpers')

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

var login = function (site) {
  return request({
    url: site.config.authenticate.url,
    method: site.config.authenticate.method.toLowerCase(),
    form: site.config.authenticate.form,
    jar: site.cookieJar
  })
}

var Site = function (url) {
  this.config = this.findConfig(url)
  this.cookieJar = this.createCookieJar()
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
  return request.head({
    url: url,
    jar: this.cookieJar
  })
}

Site.prototype.init = function (callback) {
  if (typeof this.config.authenticate === 'undefined' ||
      this.cookieJar.getCookies().length > 0) {
    return callback(this)
  }

  login(this)
    .on('response', function () {
      callback(this)
    }.bind(this))
}

Site.prototype.createCookieJar = function () {
  return request.jar()
}

module.exports = Site
