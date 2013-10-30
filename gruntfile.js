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
      build: ["build/*"],
      deploy: ["zip/*"]
    },
    uglify: {
      build: {
        files: {
          'src/js/dash.ziax.min.js': [ 'src/js/dash.ziax.js' ]
        }
      }
    },
    concat: {
      build_js: {
        files: {
          'build/src/js/dash.ziax.dk.all.min.js': [
            'build/src/js/jquery-2.0.3.min.js',
            'build/src/js/angular.min.js',
            'build/src/js/angular-route.min.js',
            'build/src/js/angular-resource.min.js',
            'build/src/js/angular-animate.min.js',
            'build/src/js/textile.min.js',
            'build/src/js/moment.min.js',
            'build/src/js/dash.ziax.min.js'
          ]
        }
      },
      build_css: {
        /*files: {
          'build/src/js/dash.ziax.dk.all.min.css': [
            'build/src/css/bs3/css/bootstrap.min.css',
            'build/src/css/dash.ziax.dk.min.css'
          ]
        }*/
      }
    },
    cssmin: {
      build: {
        files: {
          'build/src/css/dash.ziax.dk.min.css': [
            'build/src/css/dash.ziax.css'
          ]
        }
      }
    },
    htmlrefs: {
      build: {
        /** @required  - string including grunt glob variables */
        src: 'build/src/index.html',
        /** @optional  - string directory name*/
        //dest: 'build/src',
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
    copy: {
      build: {
        // files: {
        //   'build/': [ 'server.js', '_config.json', 'package.json' ]
        // }
        files: [
          {
            expand: true,
            src: ['src/**/*'],
            dest: 'build/'
          },
          {
            src: [ 'server.js', '_config.json', 'package.json' ],
            dest: 'build/'
          }
        ]
      }

    },

    // deploy to www.ziax.dk
    compress: {
      main: {
        options: {
          archive: 'zip/ziaxdash.tgz'
        },
        expand: true,
        cwd: 'build/',
        src: [ '**/*']
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
      },
      prod: {
        options: {
          script: 'build/server.js'
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
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-ftp-deploy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-htmlrefs');

  grunt.registerTask('default', []);
  grunt.registerTask('setup_es_local', ['http:local_delete', 'http:local_setup', 'http:local_dummy']);

  grunt.registerTask('deploy', ['build', 'clean:deploy', 'compress']);
  grunt.registerTask('build', ['clean:build', 'copy:build', 'uglify:build', 'concat:build_js', 'cssmin:build', 'concat:build_css', 'htmlrefs:build' ]);

  grunt.registerTask('dev', ['express:dev', 'watch']);
  grunt.registerTask('prod', ['express:prod', 'watch']);


};