var util = require('./lib/gruntutils.js'),
    Config = require('./_config.json'),
    shelljs = require('shelljs'),
    fs = require('fs'),
    deepExtend = require('deep-extend');



module.exports = function (grunt) {
  "use strict";
  var buildno = '-',
    _gruntConfig = {
      pkg: grunt.file.readJSON('package.json'),
      buildno: 'ziax',
    };
  fs.readdirSync('./lib/grunt').forEach(function(file) {
    deepExtend(_gruntConfig, require('./lib/grunt/' + file)(grunt));
  });

  // grunt.loadTasks('lib/tasks/grunt-conftransform.js');

  grunt.initConfig(_gruntConfig);

  grunt.loadTasks('lib/tasks');
  grunt.registerTask('default', ['custom']);
  // grunt.registerTask('setup_es_local', ['http:local_delete', 'http:local_setup', 'http:local_dummy']);

  // grunt.registerTask('build', ['clean:build', 'copy:build', 'uglify:build', 'concat:build_js', 'less:production', 'concat:build_css', 'htmlrefs:build', 'htmlmin:build' ]);
  // grunt.registerTask('build', ['clean:build', 'uglify:build', 'concat:build_js', 'copy:build_js', 'less:production', 'concat:build_css', 'copy:build_css', 'htmlrefs:build', 'htmlmin:build' ]);

  grunt.registerTask('build_bs3', [  ]);
  grunt.registerTask('build_css', [ 'less:build', 'cssmin:build', 'concat:build_css' ]);
  grunt.registerTask('build_js', [ 'uglify:build', 'concat:build_js' ]);
  grunt.registerTask('build', ['clean:build', 'gitrev', 'copy:build', 'concat:build_dev', 'removelogging:build', 'build_js', 'build_css', 'htmlrefs:build', 'htmlmin:build', 'clean:build_post', 'conftransform:build' ]);

  grunt.registerTask('deploy', ['build', 'clean:deploy', 'compress', 'ftp-deploy']);

  grunt.registerTask('dev', ['express:dev', /*'karma:unit:start',*/ 'watch']);
  grunt.registerTask('prod', ['express:prod', 'watch']);

  grunt.registerTask('smoke', ['express:prod', 'protractor:prod']);

  grunt.registerTask('setupall', [
    'http:deleteAll',
    'elasticsearch:play:aviation',
    'elasticsearch:play:gaz',
    'elasticsearch:backup:prod2dev',
    'http:iss',
    'http:airport',
    'http:gazStation',
    'http:gazVehicle',
    'http:gaz'
    ]);

  grunt.registerTask('setupgaz', [
    'http:deleteGaz',
    'http:deleteGazStations',
    'elasticsearch:play:gaz',
    'http:gazStation',
    'http:gazVehicle',
    'http:gaz'
    ]);

  grunt.registerTask('gitrev', function () {
    buildno = shelljs.exec('git rev-parse --short HEAD', { silent: true }).output.replace('\n', '');
    grunt.log.writeln('build is', buildno);
    grunt.config('buildno', buildno);
  });
};
