
export abstract class Site {
  abstract match (url: string): boolean

  async authenticate () {

  }

  async needsAuthentication () {
    return false
  }

  async transformUrl (url: string) {
    return url
  }

  async transformRequest () {

  }
}
