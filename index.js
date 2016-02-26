#!/usr/bin/env node

var manager = require('./lib/manager')
var args = process.argv.slice(2)

manager.on('add', function (download) {
  console.log('added: ' + download.url)
})

manager.on('download.start', function (download) {
  console.log('starting download for ', download.url)
})

manager.on('download.init', function (download) {
  console.log('init download for ', download.url)
})

manager.on('download.headers', function (download) {
  console.log('downloading file to ' + download.file)
})

manager.add(args[0])
  .on('progress', function (download) {
    console.log('progress: ', download.downloaded / download.contentLength * 100)
  })
  .start()
  .on('complete', function (download) {
    console.log('download completed: ', download.file)
  })
