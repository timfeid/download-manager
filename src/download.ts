import { matchSite } from "./sites"
import { Site } from "./sites/site"
import axios, { AxiosResponse } from 'axios'
import { EventEmitter } from "events"
import { matchDriver } from "./drivers"
import { Driver } from "./drivers/driver"
import path from 'path'

export class Download extends EventEmitter {
  url: string
  finalUrl?: string
  site: Site
  started = false
  filepath?: string
  contentLength?: number
  driver?: Driver
  downloaded = 0
  basepath = process.cwd()
  constructor (url: string) {
    super()
    this.url = url
    this.site = matchSite(url)
  }

  async start () {
    this.started = true
    try {
      this.finalUrl = await this.site.transformUrl(this.url)
      const response = await this.getHeaders()

      this.filepath = this.determineFilepath(this.determineFilename(response.headers))
      this.contentLength = parseInt(response.headers['content-length'], 10)
      this.driver = matchDriver(this, response)
      this.emit('started', this)
      await this.driver.start()
      this.emit('complete', this)
    } catch (e) {
      this.emit('error', e)
    }
  }

  public setBasepath (basepath: string) {
    this.basepath = basepath

    return this
  }

  private determineFilepath (filename: string) {
    return path.join(this.basepath, filename)
  }

  private determineFilename (headers: any) {
    const disposition: string = headers['content-disposition']

    if (disposition) {
      const matches = disposition.match(/filename="([^"]+)"/)
      if (matches) {
        return matches[1]
      }
    }

    const dirs = new URL(this.url).pathname.split('/')

    return dirs[dirs.length-1]
  }

  public progress(chunkLength: number) {
    this.downloaded += chunkLength
    this.emit('progress', this)
  }

  private async getHeaders () {
    return await axios({
      method: 'head',
      url: this.finalUrl,
      withCredentials: true,
      headers: {}
    })
  }
}
