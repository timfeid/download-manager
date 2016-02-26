'use strict'

var config = module.exports = {}

config.tempDir = './tmp/'
config.downloadDir = './downloads/'
config.defaultDriver = require('./../lib/drivers/single')

config.drivers = []
config.drivers.push(require('./../lib/drivers/parts')(8))

config.sites = []
config.sites.push(require('./sites/uploaded'))
