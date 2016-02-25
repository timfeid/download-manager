#!/usr/bin/env node

var uploaded = require('./uploaded');
var multimeter = require('multimeter');
var multi = multimeter(process);
var args = process.argv.slice(2);

uploaded.download(args[0]).on('complete', function() {
  multi.destroy();
  console.log('completed');
}).on('partCreated', function(part) {
  part.progressBar = multi(4, part.number + 2, {
    width: 20,
    solid: {
      text: '-'
    },
    empty: {
      text: ' '
    }
  });
}).on('partTick', function(part) {
  part.progressBar.percent(part.downloaded / (part.to - part.from) * 100);
});
