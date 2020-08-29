import { Site } from "./site";
import path from 'path'
import glob from 'glob'
import DefaultSite from "./default";

const sites: Site[] = []
const defaultSite = new DefaultSite()
const siteGlob = path.join(__dirname, '**', '*.site.ts')
const matches = glob.sync(siteGlob)
for (const match of matches) {
  const site = require(match).default

  if (site.prototype instanceof Site) {
    sites.push(new site)
  }
}

export function matchSite (downloadUrl: string): Site {
  return sites.find(site => site.match(downloadUrl)) || defaultSite
}
