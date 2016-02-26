'use strict'

var env = require('dotenv').config()
  , uploaded = module.exports = {}

uploaded.match = /uploaded\.net/
uploaded.authenticate = {
  url: 'http://uploaded.net/io/login',
  method: 'POST',
  form: {
    id: env.UPLOADED_USERNAME,
    pw: env.UPLOADED_PASSWORD
  }
}
