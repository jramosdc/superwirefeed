var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ProvidePlugin = require('webpack/lib/ProvidePlugin');
var path = require('path');

module.exports = {
  entry: './src/components/boot.ts',
  output: {
    path: './dist',
    filename: 'app.bundle.js'
  },
  // externals: {
  //   jquery: 'jQuery',
  // },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.css$/, loader: 'raw' },
      { test: /\.scss$/, loaders: ['raw', 'sass'] }
      // // Font Definitions
      // { test: /\.svg$/, loader: 'url?limit=65000&mimetype=image/svg+xml&name=node_modules/materialize-css/fonts/roboto/[name].[ext]' },
      // { test: /\.woff$/, loader: 'url?limit=65000&mimetype=application/font-woff&name=dist/assets/fonts/roboto/[name].[ext]' },
      // { test: /\.woff2$/, loader: 'url?limit=65000&mimetype=application/font-woff2&name=dist/assets/fonts/roboto/[name].[ext]' },
      // { test: /\.[ot]tf$/, loader: 'url?limit=65000&mimetype=application/octet-stream&name=node_modules/materialize-css/fonts/roboto/[name].[ext]' },
      // { test: /\.eot$/, loader: 'url?limit=65000&mimetype=application/vnd.ms-fontobject&name=node_modules/materialize-css/fonts/roboto/[name].[ext]' }
      // { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader:"url?limit=10000&mimetype=application/font-woff" },
      // { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file" }
      // {
      //   test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      //   loader: 'url',
      //   query: {
      //     limit: 10000,
      //     name: assetsPath('fonts/[name].[hash:7].[ext]')
      //   }
      // }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.ts', '.html', '.css'],
    alias: {
      jQuery: "jquery",
      JQuery: "jquery",
      $: "jquery"
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new CopyWebpackPlugin([
      { from: 'src/assets', to: 'assets' },
      { from: 'node_modules/materialize-css/font', to: 'font' },
      { from: 'node_modules/mdi/fonts', to: 'fonts' }
      // { from: 'node_modules/tinymce/plugins', to: 'plugins' },       // for tinymce
    ]),
    new webpack.DefinePlugin({
      app: {
        environment: JSON.stringify(process.env.APP_ENVIRONMENT || 'development')
      }
    })
    ,
    new ProvidePlugin({
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      $: 'jquery',
      'window.$': 'jquery',
    })
  ],
  devServer: {
    port: 9500,
    host: 'localhost',
  }
}


function assetsPath(_path) {
  console.log('_path: ', _path);
  var assetsSubDirectory = 'assets/';
  return path.posix.join(assetsSubDirectory, _path)
}
