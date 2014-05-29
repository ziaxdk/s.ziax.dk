module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  return {
    watch: {
      express: {
        files:  [ 'server.js', 'server/**/*.js' ],
        tasks:  [ 'express:dev' ],
        options: {
          nospawn: true //Without this option specified express won't be reloaded
        }
      },
      less: {
        files: [ 'src/css/*.less' ],
        tasks: [ 'less:development' ]
      },
      js: {
        files: [ 'src/js/app/**/*.js' ],
        tasks: [ 'concat:build_dev' ]
      }
      // ,
      // karma: {
      //   files: ['test/**/*.js'],
      //   tasks: ['karma:unit:run'] //NOTE the :run flag
      // }
    }
  };
};
