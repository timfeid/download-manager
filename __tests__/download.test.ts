import { Download } from "../src/download"
import { expect } from "chai"
import fs from 'fs'
import md5file from 'md5-file'

describe('downloads', () => {
  it('can download with parts', async () => {
    const download = new Download('https://timfeid.com/test.txt')
    download.on('error', error => console.log(error))
    download.setBasepath(`${__dirname}/downloads`).start()
    await new Promise((resolve) => download.on('started', resolve))
    await new Promise((resolve) => download.on('progress', resolve))
    await new Promise((resolve) => download.on('complete', resolve))
    const file = `${__dirname}/downloads/test.txt`
    expect(fs.existsSync(file)).to.eq(true)
    expect(await md5file(file)).to.eq('2237722a143b43d63d11cf89dcbd7072')
  })
})
