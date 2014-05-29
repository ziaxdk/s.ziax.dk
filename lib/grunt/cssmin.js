module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  return {
    cssmin: {
      build: {
        files: [
          {
            expand: true,
            src: ['build/src/css/*.css'],
            ext: '.min.css'
          }
        ]
      }
    }
  };
};
