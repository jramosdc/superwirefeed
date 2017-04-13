var webpack = require("webpack")
var def = require('./webpack.config.js')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')

def.plugins.push(
  new CleanWebpackPlugin(['dist']),
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }),
  new CopyWebpackPlugin([{
    from: './assets',
    to: './assets'
  }])
)

module.exports = def