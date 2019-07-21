#!/usr/bin/env node

process.setMaxListeners(0)

const Manager = require('./lib/manager')
const manager = new Manager({
  maxDownloads: 1
})


manager.setPath('download', '/Users/timfeid/Downloads/help')
manager.setPath('temp', '/Users/timfeid/Downloads/help')

manager.on('download.progress', function (download, bytes) {
  console.log('progress', download.originalUrl, download.downloaded / download.contentLength * 100)
})


// manager.add('https://rapidgator.net/file/faa96119d6e878808b04bdbf9806db98/GhstAvetrsS90HutigScttsdle70WBx6CFFiE.rar')
const download = manager.add('https://rapidgator.net/file/6e1eeef87f1df7cb4b4ea8cfb6675a47/ThMrthon11970BluRax6BiOAR.rar')
setTimeout(() => {
  download.cancel()
}, 3000);
  // .then(console.log.bind(console)).catch(() => console.log('installer error'))

// manager.add('https://getcomposer.org/installerrrr')
  // .then(console.log.bind(console)).catch(() => console.log('THIS SHOULD ERROR, NP [installer]'))

// manager.add('https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkg')
  // .then(console.log.bind(console)).catch(() => console.log('PACKAGE MNG ERROR'))

// manager.add('https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkgggg')
  // .then(console.log.bind(console)).catch(() => console.log('THIS SHOULD ERROR, NP [node]'))

// manager.add('https://google.com/a')
  // .then(console.log.bind(console)).catch(() => console.log('google error'))

// Promise.all([
//   'https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkgggg',
//   'https://getcomposer.org/installer',
//   'https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkgggg',
//   'https://getcomposer.org/installer',
//   'https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkgggg',
//   'https://getcomposer.org/installer',
// ].map(x => manager.download(x))).then((values => {
//   console.log(values)
// })).catch((error) => {
//   console.log('error')
// })