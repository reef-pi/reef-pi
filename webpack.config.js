var webpack = require("webpack");
var path = require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

<<<<<<< HEAD
// var BUILD_DIR = path.resolve(__dirname, "assets/");
=======
>>>>>>> upstream/master
var BUILD_DIR = path.resolve(__dirname, "ui");
var APP_DIR = path.resolve(__dirname, "jsx");

var config = {
  entry: APP_DIR + "/entry",
  resolve: {
<<<<<<< HEAD
    extensions: [".js", ".jsx"],
=======
    extensions: [".mjs",".js", ".jsx"],
>>>>>>> upstream/master
    modules: [
      "node_modules",
      path.resolve(__dirname, "jsx"),
      path.resolve(__dirname, "assets", "sass")
    ]
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: "babel-loader",
        query: {
<<<<<<< HEAD
          presets: ["es2015", "react", "stage-2"]
=======
          presets: [
            ["es2015", {"modules": false}],
            "react",
            "stage-2"
          ]
>>>>>>> upstream/master
        }
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader"
          },
          {
            loader: "sass-loader"
          }
        ]
      },
      {
        test: /\.css/,
        loaders: ["style-loader", "css-loader"]
      }
    ]
  },
  output: {
    path: BUILD_DIR,
    filename: 'assets/js/[name].js',
  },
  plugins:[
    new HtmlWebpackPlugin({
      filename: 'home.html',
      template: './assets/home.html',
      inject: true
    }),
    new MiniCssExtractPlugin({
<<<<<<< HEAD
      // Options similar to the same options in webpackOptions.output
      // both options are optional
=======
>>>>>>> upstream/master
      filename: 'assets/css/[name].css',
      chunkFilename: 'assets/css/[id].css'
    })
  ]
};

module.exports = config;
