# download-manager
Node Download Manager

*Under development*

## Example

```js
var manager = require('download-manager')
  , url = 'http://path.to/file'
  , download = manager.add(url)

  download.on('progress', function (download) {
    console.log('progress: ', download.downloaded / download.contentLength * 100)
  })
  .start()
  .on('complete', function (download) {
    console.log('download completed: ', download.file)
  })
```
