const { src, dest, series, watch } = require('gulp');
const del = require('del');
const nunjucks = require('gulp-nunjucks-render');
const beautify = require('gulp-beautify');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const minify = require('gulp-clean-css');
const terser = require('gulp-terser');
const prefix = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const imagewebp = require('gulp-webp');
const newer = require('gulp-newer');
const webpack = require('webpack-stream');
const merge = require('merge-stream');

function clean() {
   return del(['dist']);
}

function copyingfile() {
   return merge(
      src('src/fonts/*.{woff,woff2}').pipe(dest('dist/fonts')),
      src('src/files/**').pipe(dest('dist/files')),
      // src().pipe(dest())
   );
}

function compilehtml() {
   return src('src/views/pages/*.{html,njk}')
      .pipe(nunjucks({
         path: ['src/views']
      }))
      .pipe(beautify.html({ indent_size: 3, preserve_newlines: false }))
      .pipe(dest('dist'))
}

function compilescript() {
   return src('./')
      .pipe(webpack(require('./webpack.config.js')))
      .pipe(dest('dist/js'))
}

function compilesass() {
   return src('src/sass/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(prefix('last 2 versions'))
      .pipe(minify())
      .pipe(dest('dist/css'))
      .pipe(browserSync.stream())
}

function optimizeimg() {
   return src('src/images/*.{jpg,png,svg}')
      .pipe(newer('dist/images'))
      .pipe(imagemin([
         imagemin.mozjpeg({ quality: 80, progressive: true }),
         imagemin.optipng({ optimizationLevel: 2 })
      ]))
      .pipe(dest('dist/images'))
}

function webpImage() {
   return src('dist/images/*.{jpg,png}')
      .pipe(imagewebp())
      .pipe(dest('dist/images'))
}

function watchtask() {
   browserSync.init({
      server: {
         baseDir: './dist'
      }
   });
   watch('src/views/**/*.njk', compilehtml);
   watch('dist/*.html').on('change', browserSync.reload);
   watch('src/sass/**/*.scss', compilesass);
   // watch('src/images/*.{jpg,png}', optimizeimg);
   // watch('dist/images/*.{jpg,png}', webpImage);
   watch('src/js/*.js', compilescript);
}

exports.default = series(clean, compilesass, optimizeimg, webpImage, copyingfile, compilehtml);
exports.build = series(clean, compilesass, optimizeimg, webpImage, copyingfile, compilehtml);
exports.dev = series(clean, compilesass, optimizeimg, webpImage, compilehtml, compilescript, copyingfile, watchtask);
