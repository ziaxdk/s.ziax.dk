var gulp = require('gulp'),
    path = require('path'),
    gulpexpress = require('./lib/gulp/gulp-express.js'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    less = require('gulp-less'),
    livereload = require('gulp-livereload'),
    karma = require('gulp-karma');

gulp.task('server', function() {
  gulpexpress.serve({
    script: 'server.js',
    port: 8081
  });
});

gulp.task('concat:build_dev', function() {
  gulp.src('src/js/app/**/*.js')
    .pipe(concat('ziaxdash.js'))
    .pipe(header("(function () {\r\nvar module = angular.module('ziaxdash', ['ngResource', 'ngAnimate', 'ui.router']);\r\n"))
    .pipe(footer('}());'))
    .pipe(gulp.dest('./src/js'));
});

gulp.task('less:development', function() {

  gulp.src('./src/css/*.less')
    .pipe(less())
    .pipe(gulp.dest('./src/css'));

});

gulp.task('test', function() {
  return gulp.src([ '__dummy__'])
    .pipe(karma({
      configFile: './test/karma.conf.js',
      action: 'watch'
    }));
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch([ 'src/**/*.html', './src/css/ziaxdash.css', './src/js/ziaxdash.js' ]).on('change', livereload.changed);
 
  gulp.watch([ 'server.js', 'server/**/*.js' ], ['server']);
  gulp.watch('src/js/app/**/*.js', ['concat:build_dev']);
  gulp.watch('src/css/*.less', ['less:development']);
});

gulp.task( 'dev', [ 'server', 'test', 'watch' ] );
