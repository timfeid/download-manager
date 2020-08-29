import path from 'path'
import glob from 'glob'
import DefaultDriver from "./default";
import { Download } from "../download";
import { AxiosResponse } from "axios";
import { Validator, Driver } from "./driver";

type DriverMatcher = {
  matches: Validator
  driver: new () => Driver
}
const drivers: DriverMatcher[] = []
const driverGlob = path.join(__dirname, '**', '*.driver.ts')
const matches = glob.sync(driverGlob)
for (const match of matches) {
  const contents = require(match)
  const driver = contents.default
  const validator = contents.validator

  if (driver.prototype instanceof Driver && typeof validator === 'function') {
    drivers.push({
      matches: validator,
      driver,
    })
  }
}

export function matchDriver (download: Download, headerResponse: AxiosResponse): Driver {
  const driverMatcher = drivers.find(driver => driver.matches(headerResponse))
  const driverClass = driverMatcher ? driverMatcher.driver : DefaultDriver

  return new driverClass(download)
}
