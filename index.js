#!/usr/bin/env node

var uploaded = require('./uploaded')

var args = process.argv.slice(2);

uploaded.download(args[0]);