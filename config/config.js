'use strict'

var config = module.exports = {}

// where to store our temporary files
config.tempDir = './tmp/'
// where to put our downloads
config.downloadDir = './downloads/'
// default driver (download entire request in one shot)
config.defaultDriver = require('./../lib/drivers/single')

// drivers to check before using the default
config.drivers = []
// parts driver (download in multiple requests, faster)
config.drivers.push(require('./../lib/drivers/parts')(8))

// array of authenticatable websites
config.sites = []
config.sites.push(require('./sites/uploaded'))
