var config = require('./lib/config/config');
var colors = require('colors');
var path = require('path');
var mkdirp = require('mkdirp');
mkdirp(path.join(config.root, 'uploads'), 0755, function (err) {
  if(err) {
    console.log(err.red);
    return;
  }
  console.log('Upload directory created!'.green);
});