#!/usr/bin/env node

var manager = require('./lib/manager')
, helpers = require('./lib/helpers')


if (helpers.option('download-dir') !== null) {
  manager.setPath('download', helpers.option('download-dir'))
}

if (helpers.option('temp-dir') !== null) {
  manager.setPath('temp', helpers.option('temp-dir'))
}

manager.on('download.progress', function (download, bytes) {
  console.log('progress', download.url, download.downloaded / download.contentLength * 100)
})

manager.on('add', function (download) {
  download.start()
})

// called from console: `download https://getcomposer.org/installer`
helpers.args()[0].split(' ').forEach(function (url) {
  manager.add(url)
})

// other option is to call directly:
// manager.add('https://getcomposer.org/installer')
// manager.add('https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkg')