#!/usr/bin/env node

var manager = require('./lib/manager')

manager.on('download.progress', function (download) {
  console.log('progress', download.url, download.downloaded / download.contentLength * 100);
})

manager.on('add', function (download) {
  download.start();
})

manager.add('https://getcomposer.org/installer')
manager.add('https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkg')