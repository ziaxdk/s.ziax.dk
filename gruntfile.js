var util = require('./lib/gruntutils.js'),
    Config = require('./_config.json'),
    shelljs = require('shelljs');

module.exports = function (grunt) {
  "use strict";
  var buildno = '-';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    buildno: 'ziax',

    // Build
    clean: {
      build: ["build/*"],
      build_post: [ 'build/src/js/lib/**/*', '!build/src/js/lib/satellite.min.js', 'build/src/js/app/**/*' ],
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
            src: ['build/src/js/*.js', 'build/src/js/lib-ext/*.js'],
            ext: '.min.js'
          }
        ]
      }
    },
    concat: {
      build_js: {
        files: {
          'build/src/js/<%= buildno %>.min.js': [
            // 'build/src/js/lib/satellite.min.js',
            // 'build/src/js/lib/jquery-2.0.3.min.js',
            // 'build/src/js/lib/select2.min.js',
            'build/src/js/lib/angular.min.js',
            'build/src/js/lib/angular-route.min.js',
            'build/src/js/lib/angular-resource.min.js',
            'build/src/js/lib/angular-animate.min.js',
            'build/src/js/lib/textile.min.js',
            'build/src/js/lib/moment.min.js',
            'build/src/js/lib/leaflet.min.js',
            'build/src/js/lib/leaflet-bing.min.js',
            'build/src/js/lib-ext/leaflet-awesome-markers.min.js',
            'build/src/js/ziaxdash.min.js'
          ]
        }
      },
      build_css: {
        files: {
          'build/src/css/<%= buildno %>.min.css': [
            'build/src/css/animate.min.css',
            'build/src/css/leaflet.min.css',
            'build/src/css/ziaxdash.min.css',
            'build/src/css/leaflet-awesome-markers.min.css',
            'build/src/css/fa-4.0.3.min.css',
            'build/src/css/select2.min.css',
            'build/src/css/select2-bootstrap.min.css'
          ]
        }
      },
      build_dev: {
        options: {
          banner: "(function () {\r\nvar module = angular.module('ziaxdash', ['ngRoute', 'ngResource', 'ngAnimate']);\r\n",
          footer: '}());'
          // process: function (src, filePath) {
          //   var elements = src.split('\n');
          //   var finals = elements.splice(4, elements.length - 5);
          //   return finals.join('\n');
          //   //return src;
          // }
        },
        files: {
          'src/js/ziaxdash.js':  [ 'src/js/app/**/*.js' ]
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
          buildNumber: '<%= buildno %>'
        }
      }
    },
    // template: {
    //   build: {
    //     options: {
    //       data: function () {
    //         return {
    //           build: grunt.option('build')
    //         }
    //       }
    //     },
    //       src: 'build/src/index.html',
    //       dest: 'build/src/index.html'
    //   }
    // },
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
            src: ['build/src/**/*.html']
          }
        ]
      }
    },
    removelogging: {
      build: {
        // src: "dist/**/*.js" // Each file will be overwritten with the output!
        src: ['build/src/js/*.js'/*, 'build/src/js/lib-ext/*.js'*/],
        options: {

        }
      }
      // dist: {
      //   src: "build/src/js/ziaxdash.all.min.js",
      //   dest: "build/src/js/ziaxdash.all.min.js",

      //   options: {
      //     // see below for options. this is optional.
      //   }
      // }
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
    },
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
    },

    // hhttps://github.com/elasticsearch/elasticsearch-js
    elasticsearch: {
      // setup: {
      //   local: {
      //     ignoreErrors: true,
      //     config: Config.es.development,
      //     tasks: [
      //       { 'indices.deleteIndex': { _index: 'ziax'} },
      //       { 'indices.createIndex': [{ _index: 'ziax' }, grunt.file.readJSON('es/setup.json') ] },
      //       { 'bulk': [{}, grunt.file.readJSON('es/data.json') ] }
      //     ]
      //   },
      //   azure: {
      //     ignoreErrors: true,
      //     config: Config.es.deploy,
      //     tasks: [
      //       { 'indices.deleteIndex': { _index: 'ziax'} },
      //       { 'indices.createIndex': [{ _index: 'ziax' }, grunt.file.readJSON('es/setup.json') ] }
      //       // { 'bulk': [{}, grunt.file.readJSON('es/data.json') ] }
      //     ]
      //   }
      // },
      backup: {
        prod2dev: {
          indices: [
            {
              name: 'ziax',
              settings: grunt.file.readJSON('es/setup.json'),
              // ignoreData: [ 'airport' ] TODO: Need to be implemented
            }
            // { name: 'aviation', settings: grunt.file.readJSON('es/setup-aviation.json') }
          ],
          src: Config.es.production,
          dest: Config.es.development
        },
        dev2prod: {
          indices: [
            { name: 'ziax', settings: grunt.file.readJSON('es/setup.json') }
            // { name: 'aviation', settings: grunt.file.readJSON('es/setup-aviation.json') }
          ],
          src: Config.es.development,
          dest: Config.es.production
        }
      },
      play: {
        aviation: {
          indices: [
            { name: 'aviation', settings: grunt.file.readJSON('es/setup-aviation.json') }
          ],
          dest: Config.es.development
        },
        suggest: {
          indices: [
            { name: 'play', settings: grunt.file.readJSON('es/setup-play.json') }
          ],
          bulk: grunt.file.readJSON('es/bulk-play.json'),
          dest: Config.es.development
          // GET /play/_mapping
          // GET /play/_settings
          // GET /play/_search
          // POST /play/_search?search_type=count
          // {
          //     "suggest": {
          //         "my": {
          //         "text": "a",
          //             "completion": {
          //                 "size": 10,
          //                 "field": "suggest"
          //             }
          //         }
          //     }
          // }
          // GET /_analyze?analyzer=keyword
          // {
          //     this is a test. I will not survive
          // }
        }
      }
    },
    conftransform: {
      build: {
        src: '_config.json',
        dest: 'build/_config.json',
        config: {
          es: {
            production: {
              host: "http://localhost:9200"
            }
          }
        }
      }
    },

    protractor: {
      options: {
        configFile: "node_modules/protractor/referenceConf.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      prod: {
        options: {
          configFile: "protractor-prod-conf.js", // Target-specific config file
          args: {} // Target-specific arguments
        }
      },
      sauce: {
        options: {
          configFile: "protractor-prod-conf.js",
          args: {
            // seleniumAddress: 'http://ondemand.saucelabs.com/wd/hub',
            // capabilities: {
            //   name: 'Search! e2e tests',
            //   username: 'ziaxdk',
            //   accessKey: 'c0e42249-4167-406e-aa39-656895ab1387',
            //   browserName: 'internet explorer',
            //   version: '9',
            //   platform: 'Windows 7'
            // }
            seleniumAddress: 'http://hub.browserstack.com/wd/hub',
            capabilities: {
              name: 'Search! e2e tests',
              'browserstack.user': 'kenneth32',
              'browserstack.key': '4YFa9e2BmsGq4jRCCc8s',
              'browserName' : 'android',
              'platform' : 'ANDROID',
              'device' : 'HTC One X',
              'browserstack.debug': true
              // version: '9',
              // platform: 'Windows 7'
            }
          }
        }
      }
    }


    // ,
    // karma: {
    //   unit: {
    //     configFile: 'test/karma.unit.conf.js',
    //     background: true,
    //     browsers: [ 'PhantomJS' ]
    //   }
    // }


  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
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
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks("grunt-remove-logging");
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-protractor-runner');
  // grunt.loadTasks('lib/tasks/grunt-elasticsearch.js');
  grunt.loadTasks('lib/tasks');

  grunt.registerTask('default', ['custom']);
  // grunt.registerTask('setup_es_local', ['http:local_delete', 'http:local_setup', 'http:local_dummy']);

  // grunt.registerTask('build', ['clean:build', 'copy:build', 'uglify:build', 'concat:build_js', 'less:production', 'concat:build_css', 'htmlrefs:build', 'htmlmin:build' ]);
  // grunt.registerTask('build', ['clean:build', 'uglify:build', 'concat:build_js', 'copy:build_js', 'less:production', 'concat:build_css', 'copy:build_css', 'htmlrefs:build', 'htmlmin:build' ]);

  grunt.registerTask('build_css', [ 'less:build', 'cssmin:build', 'concat:build_css' ]);
  grunt.registerTask('build_js', [ 'uglify:build', 'concat:build_js' ]);
  grunt.registerTask('build', ['clean:build', 'gitrev', 'copy:build', 'concat:build_dev', 'removelogging:build', 'build_js', 'build_css', 'htmlrefs:build', 'htmlmin:build', 'clean:build_post', 'conftransform:build' ]);

  grunt.registerTask('deploy', ['build', 'clean:deploy', 'compress', 'ftp-deploy']);

  grunt.registerTask('dev', ['express:dev', /*'karma:unit:start',*/ 'watch']);
  grunt.registerTask('prod', ['express:prod', 'watch']);

  grunt.registerTask('smoke', ['express:prod', 'protractor:prod']);


  grunt.registerTask('gitrev', function () {
    buildno = shelljs.exec('git rev-parse --short HEAD', { silent: true }).output.replace('\n', '');
    grunt.log.writeln('build is', buildno);
    grunt.config('buildno', buildno);
  });
};
/*
*/