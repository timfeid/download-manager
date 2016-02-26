'use strict'

var parseUrl = function (url) {
  var match = url.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/)
  return match &&
  {
    protocol: match[1],
    host: match[2],
    hostname: match[3],
    port: match[4],
    pathname: match[5],
    search: match[6],
    hash: match[7]
  }
}

var filePath = function (dir, filename) {
  return dir.replace(/\/$/, '') + '/' + filename
}

exports.parseUrl = parseUrl
exports.filePath = filePath