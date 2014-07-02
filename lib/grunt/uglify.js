module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  return {
    uglify: {
      build: {
        files: [
          {
            expand: true,
            src: [
              'build/src/js/*.js',
              'build/src/js/lib-ext/*.js',
              'build/src/bower_components/textile-js/lib/*.js'
            ],
            ext: '.min.js'
          }
        ]
      }
    }
  };
};
