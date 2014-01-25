'use strict';

module.exports = function (grunt) {

  var elasticsearch = require('elasticsearch');
  var Async = require('async');

  grunt.registerMultiTask('elasticsearch', 'Elasticsearch stuff', function () {
    var self = this;
    function EsUtils(data) {
      this.backup = function() {
        var done = self.async();
        var config = data.data[data.args[0]]
          , indices = config.indices;
        if (!config) grunt.fail.fatal('cannot find the config: ' + data.args[0]);

        var esSrc = new elasticsearch.Client(config.src);
        esSrc.indices.getMapping({ index: indices }, function (err, response) {
          console.log(response);
          done();
        })

        // esSrc.indices.getSettings({ index: ''}, function (err, response) {
        //   console.log(response);
        //   done();
        // })

        return;
        var allTitles = [];
        var pos = 0;
        esSrc.search({
          index: '',
          scroll: '30s',
        }, function getMoreUntilDone(error, response) {
          if (error) grunt.fail.fatal(error);
          pos += response.hits.hits.length;
          grunt.log.writeln('Got', response.hits.hits.length, 'of', pos, '/', response.hits.total);
          response.hits.hits.forEach(function (hit) {
            allTitles.push(hit._source);
          });

          if (response.hits.total !== allTitles.length) {
            // now we can call scroll over and over
            esSrc.scroll({
              scrollId: response._scroll_id,
              scroll: '30s'
            }, getMoreUntilDone);
          } else {
            // console.log('every "test" title', allTitles);
            done();
          }
        });

      }
      this.setup = function() {
        grunt.log.error('todo');
        throw Error('to do');
      }
    }
    var utils = new EsUtils(this);
    utils[this.target]();

    return;
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
