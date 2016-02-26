'use strict'

var env = require('dotenv').config()
  , uploaded = module.exports = {}

// how to tell if the url is a match for this config
uploaded.match = /uploaded\.net/

// how to authenticate (form url, method, and params)
uploaded.authenticate = {
  url: 'http://uploaded.net/io/login',
  method: 'POST',
  form: {
    id: env.UPLOADED_USERNAME,
    pw: env.UPLOADED_PASSWORD
  }
}
