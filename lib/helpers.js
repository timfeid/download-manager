'use strict'

var processOptions = {}
  , fs = require('fs')
  , processArgs = []
  , processArgsv = []

var argsv = function () {
  if (processArgsv.length !== 0) {
    return processArgsv
  }

  processArgsv = process.argv.splice(2)

  return processArgsv
}

var args = function () {
  if (Object.keys(processArgs).length !== 0) {
    return processArgs
  }

  processArgs = argsv().filter(function (argument) {
    return !argument.match(/--([a-zA-Z\-]+)=?(.*)/)
  })

  return processArgs;
};

var options = function () {
  if (Object.keys(processOptions).length !== 0) {
    return processOptions
  }

  var args = argsv()
    , rawOptions = args.map(function (argument) {
      return argument.match(/--([a-zA-Z\-]+)=?(.*)/)
    })
    , index
    , option

  for (index in rawOptions) {
    option = rawOptions[index]
    if (option !== null) {
      processOptions[option[1]] = option[2] === '' ? true : option[2]
    }
  }

  return processOptions
}

var option = function (option) {
  var options = this.options()
  if (typeof options[option] === 'undefined') {
    return null
  }

  return options[option]
}

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

var writable = function (dir, type) {
  fs.access(dir, fs.W_OK, function (err) {
    if (err) {
      console.log('Can\'t write to', type, ':', dir)
      process.exit(1)
    }
  })
}

var filePath = function (dir, filename) {
  return dir.replace(/\/$/, '') + '/' + filename
}

exports.parseUrl = parseUrl
exports.filePath = filePath
exports.options = options
exports.option = option
exports.writable = writable
exports.args = args
