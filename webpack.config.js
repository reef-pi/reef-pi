var webpack = require('webpack')
var path = require('path')

var BUILD_DIR = path.resolve(__dirname, 'assets/')
var APP_DIR = path.resolve(__dirname, 'jsx')

var config = {
  entry: APP_DIR + '/ui.jsx',
  module: {
    rules: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: 'babel-loader'
      },
      {
        test: /\.css/,
        loaders: ['style-loader', 'css-loader']
      }
    ]
  },
  output: {
    path: BUILD_DIR,
    filename: 'ui.js'
  }

}

module.exports = config
