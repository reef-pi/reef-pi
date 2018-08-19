var webpack = require('webpack')
var path = require('path')
var LiveReloadPlugin = require('webpack-livereload-plugin')

var BUILD_DIR = path.resolve(__dirname, 'assets/')
var APP_DIR = path.resolve(__dirname, 'jsx')

var config = {
  entry: APP_DIR + '/entry',
  mode: 'development',
  devtool: '#eval-source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ['node_modules', path.resolve(__dirname, 'jsx')]
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-2']
        }
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
  },
  plugins: [
    new LiveReloadPlugin({delay: 1200})
  ]

}

module.exports = config
