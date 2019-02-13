#!/usr/bin/env node

process.setMaxListeners(0)

var manager = require('./lib/manager')


manager.setPath('download', '/Users/timfeid/Downloads/help')
manager.setPath('temp', '/Users/timfeid/Downloads/help')

manager.on('download.progress', function (download, bytes) {
  console.log('progress', download.url, download.downloaded / download.contentLength * 100)
})

// manager.download('https://getcomposer.org/installer')
//   .then(console.log)

Promise.all([
  'https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkg',
  'https://getcomposer.org/installer',
].map(x => manager.download(x))).then((values => {
  console.log(values)
}))