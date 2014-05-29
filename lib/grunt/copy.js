module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-copy');
  return {
    copy: {
      build: {
        files: [
          {
            expand: true,
            src: ['src/**/*'],
            dest: 'build/'
          },
          {
            src: [ 'server.js', '_config.json', 'package.json', 'server/**/*.js' ],
            dest: 'build/'
          }
        ]
      }
    }
  };
};
