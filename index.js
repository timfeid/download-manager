#!/usr/bin/env node

process.setMaxListeners(0)

const Manager = require('./lib/manager')
const manager = new Manager({
  maxDownloads: 1
})


manager.setPath('download', '/Users/timfeid/Downloads/help')
manager.setPath('temp', '/Users/timfeid/Downloads/help')

manager.on('download.progress', function (download, bytes) {
  console.log('progress', download.url, download.downloaded / download.contentLength * 100)
})

// manager.download('https://getcomposer.org/installer')
//   .then(console.log.bind(console)).catch(() => console.log('error'))

Promise.all([
  'https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkgggg',
  'https://getcomposer.org/installer',
  'https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkgggg',
  'https://getcomposer.org/installer',
  'https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkgggg',
  'https://getcomposer.org/installer',
].map(x => manager.download(x))).then((values => {
  console.log(values)
})).catch((error) => {
  console.log('error')
})