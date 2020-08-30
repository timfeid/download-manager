import { Validator, Driver } from "./driver";
import axios, { AxiosResponse } from 'axios'
import fs from 'fs'
import { EventEmitter } from "events";
// @ts-ignore
import Multistream from 'multistream'

const TOTAL_PARTS = 8

function mergeFiles(readFiles: string[], writeFile: string): Promise<boolean> {
  const fd = fs.openSync(writeFile, 'w+')
  const output = fs.createWriteStream(writeFile)
  const inputList = readFiles.map(path => fs.createReadStream(path))

  return new Promise((resolve, reject) => {
    const multiStream = new Multistream(inputList)
    multiStream.pipe(output)
    multiStream.on('end', () => {
      fs.closeSync(fd)
      resolve(true)
    })
    multiStream.on('error', () => {
      fs.closeSync(fd)
      reject(false)
    })
  })
}

class Part extends EventEmitter {
  parts: Parts
  partNumber: number
  totalBytes: number
  stream: any
  file: string
  downloaded = 0
  constructor (parts: Parts, partNumber: number) {
    super()
    this.parts = parts
    this.partNumber = partNumber
    this.totalBytes = Math.floor(parts.download.contentLength! / TOTAL_PARTS)
    this.file = `/Volumes/Extras/websites/download-manager/downloads/test.part.${this.partNumber+1}`
    this.stream = fs.createWriteStream(this.file)
  }

  get from () {
    // part number 0 = 0 * 50 = 0
    // part number 1 = 1 * 50 + 1 = 51
    // part number 2 = 2 * 50 + 1= 101
    return this.partNumber ? (this.partNumber * this.totalBytes) + 1 : 0
  }

  get to () {
    // part number 0 = (0+1) * 50 = 50
    // part number 1 = (1+1) * 50 = 100
    // part number 2 = (2+1) * 50 = 150
    return this.partNumber === TOTAL_PARTS-1 ? this.parts.download.contentLength! : (this.partNumber+1) * this.totalBytes
  }

  error (e: Error) {
    this.parts.download.emit('error', e)
  }

  progress (chunk: string) {
    this.downloaded += chunk.length
    this.parts.download.progress(chunk.length)
  }

  completed () {
    this.emit('completed')
  }

  async download () {
    try {
      const response = await axios({
        method: 'get',
        responseType: 'stream',
        url: this.parts.download.finalUrl,
        headers: {
          Range: `bytes=${this.from}-${this.to}`
        }
      })

      return await new Promise((resolve, reject) => {
        response.data.on('data', this.progress.bind(this))
        response.data.on('end', this.completed.bind(this))
        response.data.on('end', resolve)
        response.data.on('error', this.error)
        response.data.on('error', reject)
        response.data.pipe(this.stream)
      })

    } catch (e) {
      this.error(e)
    }
  }
}

export default class Parts extends Driver {
  parts: Part[] = []

  async start () {
    this.createParts()

    // await this.parts[0].download()
    await Promise.all(this.parts.map(async p => await p.download()))
    await this.joinParts()
  }

  private createParts () {
    for (let i = 0;i < TOTAL_PARTS; i++) {
      this.parts.push(new Part(this, i))
    }
  }

  private async joinParts () {
    await mergeFiles(this.parts.map(p => p.file), this.download.filepath!)
  }
}

export const validator: Validator = (response) => response.headers['accept-ranges'] === 'bytes'
