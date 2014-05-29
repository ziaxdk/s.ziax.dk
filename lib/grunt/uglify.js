module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  return {
    uglify: {
      build: {
        files: [
          {
            expand: true,
            src: ['build/src/js/*.js', 'build/src/js/lib-ext/*.js'],
            ext: '.min.js'
          }
        ]
      }
    }
  };
};
