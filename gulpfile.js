var gulp = require('gulp'),
    path = require('path'),
    gulpexpress = require('./lib/gulp/gulp-express.js'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    less = require('gulp-less');

gulp.task('server', function() {
  gulpexpress.serve({
    script: 'server.js',
    port: 8081
  });
});

gulp.task('concat:build_dev', function() {
  gulp.src('src/js/app/**/*.js')
    .pipe(concat('ziaxdash.js'))
    .pipe(header("(function () {\r\nvar module = angular.module('ziaxdash', ['ngRoute', 'ngResource', 'ngAnimate']);\r\n"))
    .pipe(footer('}());'))
    .pipe(gulp.dest('./src/js/'));
});

gulp.task('less:development', function() {

  gulp.src('./src/css/*.less')
    .pipe(less())
    .pipe(gulp.dest('./src/css'));

});

gulp.task('watch', function() {
  // var server = livereload();
  // gulp.watch('src/**').on('change', function(file) {
  //     server.changed(file.path);
  // });
  // 
  gulp.watch([ 'server.js', 'server/**/*.js' ], ['server']);
  gulp.watch('src/js/app/**/*.js', ['concat:build_dev']);
  gulp.watch('src/css/*.less', ['less:development']);
});

gulp.task( 'dev', [ 'server', 'watch' ] );


      // development: {
      //   options: {
      //     path: ['src/css']
      //   },
      //   files: [
      //     {
      //       expand: true,
      //       src: ['src/css/*.less'],
      //       ext: '.css'
      //     }
      //   ]
      // },
