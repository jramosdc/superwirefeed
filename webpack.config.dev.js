var webpack = require("webpack")
var def = require('./webpack.config.js')

def.devtool = 'inline-source-map'
def.devServer = {
  historyApiFallback: true,
  hot: true
}

module.exports = def