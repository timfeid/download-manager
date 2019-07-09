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
    var response = await axios({
      method: 'POST',
      url: `https://uploaded.net/io/login?id=${env.UPLOADED_USERNAME}&pw=${env.UPLOADED_PASSWORD}`,
      withCredentials: true,
    })
  } catch (e) {
    console.error(e)
  }
  const cookie = response.headers['set-cookie'][0]

  cookies = cookie.substr(0, cookie.indexOf(';'))

  return response

}

uploaded.cookies = function () {
  return cookies
}