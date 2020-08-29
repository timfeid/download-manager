import { Site } from "./site";
import { config } from "../config";
import axios from 'axios'
import qs from 'querystring'

type SID = {
  last_retrieved: number
  session_id: string
  expire_date: number
  traffic_left: string
}

export default class Rapidgator extends Site {
  sid?: SID
  username: string
  password: string

  constructor () {
    super()
    this.username = config.env?.RAPIDGATOR_USERNAME || ''
    this.password = config.env?.RAPIDGATOR_PASSWORD || ''
  }

  match (url: string) {
    return /rapidgator\.net/.test(url)
  }

  async authenticate () {
    if (!!this.username && !!this.password && await this.needsAuthentication()) {
      await this.getSid()
    }
  }

  async needsAuthentication () {
    const oneHourAgo = Date.now() - (1000 * 60 * 60)

    return !this.sid || this.sid.last_retrieved < oneHourAgo
  }

  async getSid() {
    try {
      const query = qs.stringify({
        username: this.username,
        password: this.password,
      })

      const response = await axios({
        url: `https://rapidgator.net/api/user/login?${query}`,
      })

      this.sid = {
        ...response.data.response,
        last_retrieved: Date.now(),
      }
      console.log(this.sid)
    } catch (e) {
      console.error(e)
    }

    return this.sid
  }

  async transformUrl (url: string) {
    if (await this.needsAuthentication()) {
      await this.authenticate()
    }

    try {
      const query = qs.stringify({
        sid: this.sid?.session_id,
        url,
      })
      const response = await axios(`https://rapidgator.net/api/file/download?${query}`)

      return response.data.response.url
    } catch (e) {
      console.log(e)
      return url
    }
  }
}
