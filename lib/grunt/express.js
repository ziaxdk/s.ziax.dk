module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-express-server');
  return {
    // Dev
    express: {
      options: {
        port: 8081
      },
      dev: {
        options: {
          script: 'server.js'
        }
      },
      prod: {
        options: {
          script: 'build/server.js'
        }
      }
    }
  };
};
