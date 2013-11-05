'use strict';

module.exports = function (grunt) {

  var es = require('elasticsearch');
  var Async = require('async');

  grunt.registerMultiTask('elasticsearch', 'Elasticsearch stuff', function () {
    var tasks = this.data.tasks,
        data = this.data,
        client = es.createClient(data.config);

    function es_execute (done, cmd) {
      var fn = client,
          name = cmd.key,
          val = cmd.val,
          args;
      
      function http_cb (err, _data) {
        if (err && !data.ignoreErrors) grunt.fail.fatal(err);
        grunt.log.ok('"' + name + '" ok');
        done(null, true);
      }

      name.split('.').forEach(function (parameter) {
        fn = fn[parameter];
      });
      if (typeof(fn) !== 'function') grunt.fail.fatal('Cannot find "' + name + '" on client');

      args = (Object.prototype.toString.call(val) === '[object Array]') ? val : [val];
      args.push(http_cb);
      fn.apply(fn, args);
    };

    this.async();
    var map = function (item, cb) {
      var key = Object.getOwnPropertyNames(item)[0];
      var val = item[key];
      var fn = { key: key, val: val };
      cb(null,  fn);
    };

    var run = function (item, cb)  {
      // setTimeout(function() { console.log('did', item.key); cb(null, 1); }, 1000);
      es_execute(cb, item);
    };

    Async.map(tasks, map, function(err, results) {
        Async.eachSeries(results, run, function (err2, results2) {
          if (err2) grunt.fail.fatal(err2);
          grunt.log.ok('all done');
        });
    });
  });
};
