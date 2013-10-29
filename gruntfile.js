"use strict";
var util = require('./lib/gruntutils.js');
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
        json: grunt.file.readJSON('es/setup.json')
      },
      local_dummy: {
        url: esurl + "/_bulk",
        ignoreErrors: true,
        method: 'POST',
        body: grunt.file.read('es/data.json')
      }
    },


    // Build
    clean: {
      build: ["build/*"]
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        report: 'min'
      },
      build: {
        files: {
          'src/js/ziaxdash.min.js': [ 'src/js/ziaxdash.js' ]
        }
      }
    },
    concat: {
      build: {
        files: {
          'build/js/dash.ziax.dk.min.js': [
            'src/js/jquery-2.0.3.min.js',
            'src/js/angular.min.js',
            'src/js/angular-route.min.js',
            'src/js/angular-resource.min.js',
            'src/js/angular-animate.min.js',
            'src/js/textile.min.js',
            'src/js/moment.min.js',
            //'src/js/ngProgress.min.js',
            'src/js/ziaxdash.min.js'
          ]
        }
      }
    },
    htmlrefs: {
      build: {
        /** @required  - string including grunt glob variables */
        src: 'src/index.html',
        /** @optional  - string directory name*/
        dest: 'build/',
        /** @optional  - references external files to be included */
        /*includes: {
          analytics: './ga.inc' // in this case it's google analytics (see sample below)
        },*/
        /** any other parameter included on the options will be passed for template evaluation */
        options: {
          buildNumber: 47878
        }
      }
    },

    // deploy to www.ziax.dk
    compress: {
      main: {
        options: {
          archive: 'zip/ziaxdash.tgz'
        },
        files: [
          { src: ['build/**/*'], dest: '/' },
          { src: ['server.js'], dest: '/' },
          { src: ['_config.json'], dest: '/' },
          { src: ['package.json'], dest: '/' }
        ]
      }
    },
    'ftp-deploy': {
      build: {
        auth: Config.ftp.auth,
        src: 'zip',
        dest: Config.ftp.dest
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
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-ftp-deploy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-htmlrefs');

  grunt.registerTask('default', []);
  grunt.registerTask('setup_es_local', ['http:local_delete', 'http:local_setup', 'http:local_dummy']);
  grunt.registerTask('deploy', ['compress', 'ftp-deploy']);
  grunt.registerTask('build', ['clean:build', 'uglify:build', 'concat:build', 'htmlrefs:build']);

  grunt.registerTask('dev', ['express:dev', 'watch']);


};