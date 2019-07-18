'use strict'

var axios = require('axios')
var env = require('dotenv').config()
  , rg = module.exports = {}
var fs = require('fs')
var path = require('path')
var sidFile = path.resolve(__dirname, 'rapidgator.sid')
var sid = fs.existsSync(sidFile) ? JSON.parse(fs.readFileSync(sidFile)) : null

function needsReauthentication() {
  return true
  // return sid.expire_date <= Math.floor(new Date() / 1000)
}

async function getSid() {
  try {
    const response = await axios({
      url: `https://rapidgator.net/api/user/login?username=${encodeURIComponent(env.RAPIDGATOR_USERNAME)}&password=${encodeURIComponent(env.RAPIDGATOR_PASSWORD)}`,
    })

    sid = response.data.response

    fs.writeFileSync(sidFile, JSON.stringify(sid))

    return sid
  } catch (e) {
    console.error(e)
  }
  return null
}

rg.transformUrl = async function (url) {
  if (needsReauthentication()) {
    sid = null
    await rg.authenticate()
  }

  try {

    const response = await axios({
      url: `https://rapidgator.net/api/file/download?sid=${sid.session_id}&url=${encodeURIComponent(url)}`,
    })
    return response.data.response.url
  } catch (e) {
    return url
  }

}

// how to tell if the url is a match for this config
rg.match = /rapidgator\.net/

// how to authenticate (form url, method, and params)
rg.authenticate = async function () {
  if (!sid || needsReauthentication()) {
    await getSid()
  }

  return
}

rg.maxParts = 4