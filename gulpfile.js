// Improt Modules
var gulp = require('gulp');
var del = require('del');
var url = require('url');
var fs = require('fs');
var watch = require('gulp-watch');
var sequence = require('gulp-sequence');
var webserver = require('gulp-webserver');
var typescript = require('gulp-typescript');
var tscConfig = require('./tsconfig.json');

// Define Paths
var path = {
  libjs: [
      { dist: 'lib/@angular', src: 'node_modules/@angular/**' },
      { dist: 'lib/angular2-in-memory-web-api', src: 'node_modules/angular2-in-memory-web-api/**' },
      { dist: 'lib/rxjs', src: 'node_modules/rxjs/**' },
      { dist: 'lib/angularfire2', src: 'node_modules/angularfire2/**' }, 
      { dist: 'lib/tinymce', src: 'node_modules/tinymce/**' }, 
      { dist: 'lib', src: 'node_modules/core-js/client/shim.min.js' },
      { dist: 'lib', src: 'node_modules/core-js/client/shim.min.js.map' },
      { dist: 'lib', src: 'node_modules/zone.js/dist/zone.js' },
      { dist: 'lib', src: 'node_modules/reflect-metadata/Reflect.js' },
      { dist: 'lib', src: 'node_modules/reflect-metadata/Reflect.js.map' },
      { dist: 'lib', src: 'node_modules/systemjs/dist/system.src.js' },
      { dist: 'lib', src: 'node_modules/jquery/dist/jquery.js' },
      { dist: 'lib', src: 'node_modules/materialize-css/dist/js/materialize.js' },
      { dist: 'lib', src: 'node_modules/materialize-tags/dist/js/materialize-tags.js' },
      { dist: 'lib', src: 'node_modules/linkifyjs/dist/linkify.js' },
      { dist: 'lib', src: 'node_modules/linkifyjs/dist/linkify-jquery.js' },
      { dist: 'lib', src: 'node_modules/firebase/firebase.js' },
      { dist: 'lib/ng2-img-cropper', src: 'node_modules/ng2-img-cropper/**' }
  ],
  libcss: [
    'node_modules/materialize-css/dist/css/materialize.css',
    'node_modules/materialize-tags/dist/css/materialize-tags.css',
    'node_modules/mdi/css/materialdesignicons.css',
    'node_modules/mdi/css/materialdesignicons.css.map'
  ],
  libfonts: [
    'node_modules/materialize-css/dist/fonts/**/*',
    'node_modules/mdi/fonts/**/*'
  ],
  index: 'src/index.html',
  html: 'src/components/**/*.html',
  css: 'src/components/**/*.css',
  ts: 'src/components/**/*.ts',
  dist: 'dist',
  distapp: 'dist/components',
  distlib: 'dist/lib',
  distfonts: 'dist/fonts'
};

// Clean the Contents of the Distribution Directory
gulp.task('clean', function () {
  return del(path.dist);
});

// Copy Index
gulp.task('copy:index', function () {
  return gulp.src(path.index)
    .pipe(gulp.dest(path.dist));
});

// Copy Html
gulp.task('copy:html', function () {
  return gulp.src(path.html)
    .pipe(gulp.dest(path.distapp));
});

// Copy Css
gulp.task('copy:css', function () {
  return gulp.src(path.css)
    .pipe(gulp.dest(path.distapp));
});

// copy Libs
gulp.task('copy:libjs', function () {
    path.libjs.forEach(function (val, indx) {
        gulp.src(val.src)
            .pipe(gulp.dest(path.dist + '/' + val.dist));
    });
});
gulp.task('copy:libcss', function () {
  return gulp.src(path.libcss)
    .pipe(gulp.dest(path.distlib));
});

// copy Fonts
gulp.task('copy:fonts', function () {
  return gulp.src(path.libfonts)
    .pipe(gulp.dest(path.distfonts));
});

// TypeScript Transpile
gulp.task('transpile', function () {
  return gulp
    .src(path.ts)
    .pipe(typescript(tscConfig.compilerOptions))
    .pipe(gulp.dest(path.distapp));
});

// Build Project
gulp.task('build', sequence('clean', 'copy:index', 'copy:html', 'copy:css', 'copy:libjs', 'copy:libcss', 'copy:fonts', 'transpile'));

// Default Task
gulp.task('default', sequence('build', ['serve', 'watch']));

// Serve Task
gulp.task('serve', function () {
  gulp.src('dist')
    .pipe(webserver({
      livereload: true,
      open: true,
      directoryListing: {
        enable: true,
        path: '/index.html'
      },
      middleware: function(req, res, next) {
        var fileName = url.parse(req.url);
        fileName = fileName.href.split(fileName.search).join("");
        var fileExists = fs.existsSync("./dist/" + fileName);
        if (!fileExists) {
            req.url = "/index.html";
        }
        return next();
      }
    }));
});

// Watch Task
gulp.task('watch', ['watchts', 'watchcss', 'watchhtml', 'watchindex']);

// Watch TypeScript
gulp.task('watchts', function () {
  gulp.watch(path.ts, ['transpile'])
  // return watch(path.ts)
  //   .pipe(typescript(tscConfig.compilerOptions))
  //   .pipe(gulp.dest(path.distapp));
});

// Watch Index
gulp.task('watchindex', function () {
  return watch(path.index)
    .pipe(gulp.dest(path.dist));
});

// Watch Html
gulp.task('watchhtml', function () {
  return watch(path.html)
    .pipe(gulp.dest(path.distapp));
});

// Watch CSS
gulp.task('watchcss', function () {
  return watch(path.css)
    .pipe(gulp.dest(path.distapp));
});
