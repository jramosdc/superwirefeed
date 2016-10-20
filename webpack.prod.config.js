var path = require('path');
var zlib = require('zlib');
// Webpack Plugins
var webpack = require('webpack');
var ProvidePlugin = require('webpack/lib/ProvidePlugin');
var DefinePlugin = require('webpack/lib/DefinePlugin');
var OccurenceOrderPlugin = require('webpack/lib/optimize/OccurenceOrderPlugin');
var DedupePlugin = require('webpack/lib/optimize/DedupePlugin');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var CompressionPlugin = require('compression-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackMd5Hash = require('webpack-md5-hash');
var ENV = process.env.NODE_ENV = process.env.ENV = 'production';
var HOST = process.env.HOST || 'localhost';
var PORT = process.env.PORT || 8080;

var metadata = {
    title: 'Supperwire',
    baseUrl: '/',
    host: HOST,
    port: PORT,
    ENV: ENV
};

module.exports = {
    // static data for index.html
    metadata: metadata,
    // for faster builds use 'eval'
    devtool: 'source-map',
    debug: false,
    entry: './src/components/boot.ts', // our angular app
    // Config for our build files
    output: {
        path: root('dist'),
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].bundle.map',
        chunkFilename: '[id].chunk.js'
    },

    resolve: {
        cache: false,
        // ensure loader extensions match
        extensions: prepend(['', '.js', '.ts', '.html', '.css'], '.async'), // ensure .async.ts etc also works
        alias: {
            jQuery: "jquery/dist/jquery"
        }
    },

    module: {
        loaders: [
            // Support for .ts files.
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                query: {
                    // remove TypeScript helpers to be injected below by DefinePlugin
                    'compilerOptions': {
                        'removeComments': true,
                        // 'noEmitHelpers': true,
                    }
                }
            },
            // Support for *.json files.
            { test: /\.json$/, loader: 'json-loader' },
            // Support for CSS as raw text
            { test: /\.css$/, loader: 'raw-loader' },
            // support for .html as raw text
            { test: /\.html$/, loader: 'raw-loader', exclude: [root('src/index.html')] },
            { test: /\.scss$/, loaders: ['raw-loader', 'sass-loader'] },
            { test: /\.(woff2?|ttf|eot|svg)$/, loader: 'url?limit=10000&name=[name].[ext]' },

            // if you add a loader include the file extension
        ]
    },

    plugins: [
        new WebpackMd5Hash(),
        new DedupePlugin(),
        new OccurenceOrderPlugin(true),
        // new CommonsChunkPlugin({
        //   name: 'polyfills',
        //   filename: 'polyfills.[chunkhash].bundle.js',
        //   chunks: Infinity
        // }),
        // static assets
        new CopyWebpackPlugin([
            { from: 'src/assets', to: 'assets' },
            { from: 'node_modules/materialize-css/fonts', to: 'fonts' },
            { from: 'node_modules/mdi/fonts', to: 'fonts' }
        ]),
        // generating html
        new HtmlWebpackPlugin({ template: 'src/index.html' }),
        new DefinePlugin({
            // Environment helpers
            'process.env': {
                'ENV': JSON.stringify(metadata.ENV),
                'NODE_ENV': JSON.stringify(metadata.ENV)
            }
        }),
        new ProvidePlugin({
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            $: 'jquery',
            'window.$': 'jquery'
        }),
        new UglifyJsPlugin({
            // to debug prod builds uncomment //debug lines and comment //prod lines

            // beautify: true,//debug
            // mangle: false,//debug
            // dead_code: false,//debug
            // unused: false,//debug
            // deadCode: false,//debug
            // compress : { screw_ie8 : true, keep_fnames: true, drop_debugger: false, dead_code: false, unused: false, }, // debug
            // comments: true,//debug

            beautify: false,//prod
            // disable mangling because of a bug in angular2 beta.1, beta.2 and beta.3
            // TODO(mastertinner): enable mangling as soon as angular2 beta.4 is out
            // mangle: { screw_ie8 : true },//prod
            mangle: false,
            compress: { screw_ie8: true },//prod
            comments: false//prod

        }),
        // include uglify in production
        // new CompressionPlugin({
        //   algorithm: gzipMaxLevel,
        //   regExp: /\.css$|\.html$|\.js$|\.map$/,
        //   threshold: 2 * 1024
        // })
    ],
    // Other module loader config
    tslint: {
        emitErrors: true,
        failOnHint: true
    },
    // don't use devServer for production

    // we need this due to problems with es6-shim
    node: {
        global: 'window',
        progress: false,
        crypto: 'empty',
        module: false,
        clearImmediate: false,
        setImmediate: false
    }
};

// Helper functions
function gzipMaxLevel(buffer, callback) {
    return zlib['gzip'](buffer, { level: 9 })
}

function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [__dirname].concat(args));
}

function rootNode(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return root.apply(path, ['node_modules'].concat(args));
}

function prepend(extensions, args) {
    args = args || [];
    if (!Array.isArray(args)) { args = [args] }
    return extensions.reduce(function (memo, val) {
        return memo.concat(val, args.map(function (prefix) {
            return prefix + val
        }));
    }, ['']);
}