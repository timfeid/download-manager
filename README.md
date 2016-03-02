# download-manager
Node Download Manager

*Under development*

## Example

```js
var manager = require('dl-manager')
  , url = 'http://path.to/file'

  manager.on('download.progress', function (download) {
    console.log('progress: ', download.downloaded / download.contentLength * 100)
  })
  .on('download.add', function (download) {
    download.start()
  })
  .on('download.complete', function (download) {
    console.log('download completed: ', download.file)
  })
  .add(url)
```
