const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

var BUILD_DIR = path.resolve(__dirname, 'bin', 'ui')
var APP_DIR = path.resolve(__dirname, 'front-end', 'src')
var ASSETS_DIR = path.resolve(__dirname, 'front-end', 'assets')

var config = {
  entry: APP_DIR + '/entry',
  resolve: {
    extensions: ['.mjs', '.js', '.jsx'],
    modules: [
      'node_modules',
      path.resolve(__dirname, 'front-end', 'src'),
      path.resolve(__dirname, 'front-end', 'assets', 'sass')
    ]
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: 'babel-loader',
        query: {
          presets: [['es2015', { modules: false }], 'react', 'stage-2']
        }
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: function() {
                return [require('precss'), require('autoprefixer')]
              }
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
        type: 'javascript/auto'
      },
      {
        test: /\.css/,
        loaders: ['style-loader', 'css-loader']
      }
    ]
  },
  output: {
    path: BUILD_DIR,
    filename: 'assets/js/[name].[contenthash].js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new CleanWebpackPlugin([BUILD_DIR]),
    new HtmlWebpackPlugin({
      favicon: path.join(ASSETS_DIR, 'favicon.ico'),
      filename: 'home.html',
      template: path.join(ASSETS_DIR, 'home.html'),
      inject: true
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].[contenthash].css',
      chunkFilename: 'assets/css/[id].css'
    })
  ]
}

module.exports = config
