module.exports = function (grunt) {
  'use strict';
  var deepExtend = require('deep-extend');

  grunt.registerMultiTask('conftransform', 'Transform the config', function () {
    var self = this,
        src = self.data.src,
        dest = self.data.dest,
        merge = self.data.config;

    var conf = grunt.file.readJSON(src);
    deepExtend(conf, merge);
    grunt.file.write(dest, JSON.stringify(conf, null, '  '));
  });
};
