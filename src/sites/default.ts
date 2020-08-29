import { Site } from "./site";

export default class DefaultSite extends Site {
  match (url: string) {
    return true
  }
}
