import { Validator, Driver } from "./driver";

export default class DefaultDriver extends Driver {
  async start () {
    console.log('we are defaulted')
  }
}
