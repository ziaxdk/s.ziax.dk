var util = require('./gruntutils.js');
var Config = require('./_config.json');
var esurl = 'http://localhost:9200';

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    http: {
      local_delete: {
        url: esurl + "/ziax",
        ignoreErrors: true,
        method: 'DELETE'
      },
      local_setup: {
        url: esurl + "/ziax",
        ignoreErrors: true,
        method: 'PUT',
        json: grunt.file.readJSON('setup.json')
      },
      local_dummy: {
        url: esurl + "/_bulk",
        ignoreErrors: true,
        method: 'POST',
        body: grunt.file.read('data.json')
      }
    },



    // deploy to www.ziax.dk
    compress: {
      main: {
        options: {
          archive: 'zip/ziaxdash.tgz'
        },
        files: [
          { src: ['src/**/*'], dest: '/' },
          { src: ['server.js'], dest: '/' },
          { src: ['package.json'], dest: '/' }
        ]
      }
    },
    'ftp-deploy': {
      build: {
        auth: Config.ftp,
        src: 'zip',
        dest: '/public_html/_ziax-dash/'
      }
    },

    // Dev
    express: {
      options: {
        port: 8080
      },
      dev: {
        options: {
          script: 'server.js'
        }
      }
    },
    watch: {
      express: {
        files:  [ 'server.js' ],
        tasks:  [ 'express:dev' ],
        options: {
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-http');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-ftp-deploy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('default', []);
  grunt.registerTask('setup_es_local', ['http:local_delete', 'http:local_setup', 'http:local_dummy']);
  grunt.registerTask('deploy', ['compress', 'ftp-deploy']);

  grunt.registerTask('dev', ['express:dev', 'watch']);


};