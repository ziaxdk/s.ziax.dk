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
      build_post: [ 'build/src/js/lib/**/*' ],
      deploy: ["zip/*"]
    },
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
    },
    uglify: {
      build: {
        files: [
          {
            expand: true,
            src: ['build/src/js/*.js'],
            ext: '.min.js'
          }
        ]
      }
    },
    concat: {
      build_js: {
        files: {
          'build/src/js/ziaxdash.all.min.js': [
            'build/src/js/lib/angular.min.js',
            'build/src/js/lib/angular-route.min.js',
            'build/src/js/lib/angular-resource.min.js',
            'build/src/js/lib/angular-animate.min.js',
            'build/src/js/lib/textile.min.js',
            'build/src/js/lib/moment.min.js',
            'build/src/js/ziaxdash.min.js'
          ]
        }
      },
      build_css: {
        files: {
          'build/src/css/ziaxdash.all.min.css': [
            'build/src/css/ziaxdash.min.css',
            'build/src/css/ng-trans.min.css'
          ]
        }
      }
    },
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
    htmlmin: {
      build: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: [
          {
            expand: true,
            src: ['build/src/*.html']
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
      },
      less: {
        files: [ 'src/css/*.less' ],
        tasks: [ 'less:development' ]
      }
    },

    // https://github.com/ncb000gt/node-es/blob/master/lib/core.js
    elasticsearch: {
      local: {
        ignoreErrors: true,
        config: Config.es.development,
        tasks: [
          { 'indices.deleteIndex': { _index: 'ziax'} },
          { 'indices.createIndex': [{ _index: 'ziax' }, grunt.file.readJSON('es/setup.json') ] },
          { 'bulk': [{}, grunt.file.readJSON('es/data.json') ] }
        ]
      },
      azure: {
        ignoreErrors: true,
        config: Config.es.deploy,
        tasks: [
          { 'indices.deleteIndex': { _index: 'ziax'} },
          { 'indices.createIndex': [{ _index: 'ziax' }, grunt.file.readJSON('es/setup.json') ] },
          { 'bulk': [{}, grunt.file.readJSON('es/data.json') ] }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-http');
  grunt.loadNpmTasks('grunt-ftp-deploy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-htmlrefs');
  // grunt.loadTasks('lib/tasks/grunt-elasticsearch.js');
  grunt.loadTasks('lib/tasks');

  grunt.registerTask('default', []);
  // grunt.registerTask('setup_es_local', ['http:local_delete', 'http:local_setup', 'http:local_dummy']);

  // grunt.registerTask('build', ['clean:build', 'copy:build', 'uglify:build', 'concat:build_js', 'less:production', 'concat:build_css', 'htmlrefs:build', 'htmlmin:build' ]);
  // grunt.registerTask('build', ['clean:build', 'uglify:build', 'concat:build_js', 'copy:build_js', 'less:production', 'concat:build_css', 'copy:build_css', 'htmlrefs:build', 'htmlmin:build' ]);

  grunt.registerTask('build_css', [ 'less:build', 'cssmin:build', 'concat:build_css' ]);
  grunt.registerTask('build_js', [ 'uglify:build', 'concat:build_js' ]);
  grunt.registerTask('build', ['clean:build', 'copy:build', 'build_js', 'build_css', 'htmlrefs:build', 'htmlmin:build', 'clean:build_post' ]);

  grunt.registerTask('deploy', ['build', 'clean:deploy', 'compress', 'ftp-deploy']);

  grunt.registerTask('dev', ['express:dev', 'watch']);
  grunt.registerTask('prod', ['express:prod', 'watch']);
};