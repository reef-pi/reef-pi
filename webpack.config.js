var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'assets/public');
var APP_DIR = path.resolve(__dirname, 'assets/jsx');

var config = {
  entry: APP_DIR + '/ui.jsx',
	module : {
    loaders : [
      {
        test : /\.jsx?/,
        include : APP_DIR,
        loader : 'babel'
      }
    ]
  },
  output: {
    path: BUILD_DIR,
    filename: 'ui.js'
  }

};

module.exports = config;
