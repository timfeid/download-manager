import { Download } from "../src/download"

describe('download', () => {
  it('can download with parts', async () => {
    const download = new Download('downloadurl')
    download.on('error', error => console.log(error))
    await download.start()
  })
})
