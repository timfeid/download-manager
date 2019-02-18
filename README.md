# download-manager
Node Download Manager

*Under development*

## Example

```js
var Manager = require('dl-manager')
  , manager = new Manager()
  , url = 'http://path.to/file'

  manager
    .on('download.progress', function (download) {
      console.log('progress: ', download.downloaded / download.contentLength * 100)
    })
    .on('download.complete', function (download) {
      console.log('download completed: ', download.file)
    })
    .download(url)
```

```js
var Manager = require('dl-manager')
  , manager = new Manager()

Promise.all([
  'https://nodejs.org/dist/v4.3.1/node-v4.3.1.pkg',
  'https://getcomposer.org/installer',
].map(f => manager.download(f))).then((values => {
  console.log(values)
}))
```