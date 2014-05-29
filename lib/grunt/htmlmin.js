module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  return {
    htmlmin: {
      build: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [
          {
            expand: true,
            src: ['build/src/**/*.html']
          }
        ]
      }
    }
  };
};
