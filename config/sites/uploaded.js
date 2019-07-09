'use strict'

var axios = require('axios')
var cookies = null

var env = require('dotenv').config()
  , uploaded = module.exports = {}

// how to tell if the url is a match for this config
uploaded.match = /uploaded\.net/

// how to authenticate (form url, method, and params)
uploaded.authenticate = async function () {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://uploaded.net/io/login',
      withCredentials: true,
      data: `id=${encodeURIComponent(env.UPLOADED_USERNAME)}&pw=${encodeURIComponent(env.UPLOADED_PASSWORD)}`,
    })

    cookies = response.headers['set-cookie'].map((cookie) => cookie.substr(0, cookie.indexOf(';'))).join(';')
  } catch (e) {
    console.error(e)
  }

}

uploaded.cookies = function () {
  return cookies
}