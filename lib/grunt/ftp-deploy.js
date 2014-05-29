module.exports = function(grunt) {
  var Config = require('../../_config.json');
  grunt.loadNpmTasks('grunt-ftp-deploy');
  return {
    'ftp-deploy': {
      build: {
        auth: Config.ftp.auth,
        src: 'zip',
        dest: Config.ftp.dest
      }
    }
  };
};
