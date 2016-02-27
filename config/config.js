'use strict'

var config = module.exports = {}

config.dirs = {}
// default dir to store our temporary files
// override with --temp-dir=/path
config.dirs.temp = '/tmp'
// default dir to put our downloads
// override with --download-dir=/path
config.dirs.download = '.'

// default driver (download entire request in one shot)
config.defaultDriver = require('./../lib/drivers/single')

// drivers to check before using the default
config.drivers = []
// parts driver (download in multiple requests, faster)
config.drivers.push(require('./../lib/drivers/parts')(8))

// array of authenticatable websites
config.sites = []
config.sites.push(require('./sites/uploaded'))
