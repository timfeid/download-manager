'use strict'

var Site = require('./site')
  , sites = {}

var findFromCache = function (sites, url) {
  var matchingSite = null
  sites.forEach(function (site) {
    if (site.matches(url)) {
      matchingSite = site
    }
  })

  return matchingSite
}

sites.sites = []

sites.find = function (url) {
  var matchingSite = findFromCache(this.sites, url)

  if (matchingSite === null) {
    matchingSite = new Site(url)
    sites.sites.push(matchingSite)
  }

  matchingSite.urls.push(url)

  return matchingSite
}

sites.with = function (url, callback) {
  var site = sites.find(url)

  return site.init(callback)
}

module.exports = sites
