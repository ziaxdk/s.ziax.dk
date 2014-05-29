module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-less');
  return {
    less: {
      development: {
        options: {
          path: ['src/css']
        },
        files: [
          {
            expand: true,
            src: ['src/css/*.less'],
            ext: '.css'
          }
        ]
      },
      build: {
        options: {
          path: ['build/src/css']
          // cleancss: true
        },
        files: [
          {
            expand: true,
            src: ['build/src/css/*.less'],
            ext: '.min.css'
          }
        ]
      }
    }
  };
};