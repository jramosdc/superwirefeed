var webpack = require("webpack")
var path = require('path')
var precss = require('precss')
var postcssImport = require('postcss-import')
var cssnext = require('postcss-cssnext')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './app/index.js',
  template: './index.html',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.[hash].js',
    publicPath: ''
  },
  resolve: {
    modulesDirectories: ['node_modules', 'shared'],
    extensions: ['', '.js', '.jsx'],
    alias: {
      'react': path.resolve(
        path.join(__dirname, 'node_modules', 'react')
      )
    }
  },
  module: {
    loaders: [{
      test: /\.css$/,
      exclude: ['node_modules'],
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader')
    }, {
      test: /(\.js)|(\.jsx)$/,
      exclude: ['node_modules'],
      loader: 'babel',
      query: {
        presets: ['es2015', 'react', 'stage-0'],
        plugins: ['transform-class-properties']
      }
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /\.svg$/,
      loader: 'babel!react-svg'
    }, {
      test: /.*\.(gif|png|jpe?g|svg)$/i,
      loaders: [
        'file?hash=sha512&digest=hex&name=[hash].[ext]',
        'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}'
      ]
    }]
  },
  postcss: function (webpack) {
    return [
      postcssImport({
        addDependencyTo: webpack
      }),
      precss,
      cssnext()
    ]
  },
  plugins: [
    new ExtractTextPlugin('bundle.[hash].css'),
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      children: true,
      async: true
    })
  ]
}