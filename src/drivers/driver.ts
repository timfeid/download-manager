import { Download } from "../download";
import { AxiosResponse } from "axios";

export abstract class Driver {
  download: Download

  constructor (download: Download) {
    this.download = download
  }

  abstract async start (): Promise<void>
}

export type Validator = (headersResponse: AxiosResponse) => boolean
