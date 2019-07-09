'use strict'

var config = require('./../config/config')
  , helpers = require('./helpers')
  , Events = require('./events')
  , axios = require('axios')

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
  this.urls = []
  this.config = this.findConfig(url)
  this.authed = false
  this.authing = false
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
  const opts = {
    method: 'head',
    url,
    withCredentials: true,
    headers: {
      Cookie: typeof this.config.cookies === 'function' ? this.config.cookies() : ''
    },
  }

  return axios(opts)
}

Site.prototype.authenticated = function (response) {
  this.authed = true
  this.authing = false
}

Site.prototype.on = function (event, callback) {
  this.events.on(event, callback)
  return this
}

Site.prototype.convertUrl = async function (url) {
  if (typeof this.config.transformUrl === 'function') {
    try {

      return await this.config.transformUrl(url)
    } catch (e) {
      console.error(e)
    }
  }

  return url
}

Site.prototype.init = async function (callback) {
  if (typeof this.config.authenticate === 'undefined' ||
      this.authed) {
    return callback(this)
  }

  this.on('authenticated', callback)

  if (!this.authing) {
    this.authing = true

    try {

      const response = await this.config.authenticate.call(this)
      this.events.trigger('authenticated', response)

    } catch (e) {
      this.events.trigger('error', e)

    }
  }
}

module.exports = Site
