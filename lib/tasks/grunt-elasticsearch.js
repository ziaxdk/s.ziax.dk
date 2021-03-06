'use strict';

module.exports = function (grunt) {

  var elasticsearch = require('elasticsearch'),
      Async = require('async'),
      _ = require('lodash'),
      Q = require('Q');

  grunt.registerMultiTask('elasticsearch', 'Elasticsearch stuff', function () {
    var self = this;
    
    function EsUtils(data) {
      var esSrc, esDest;

      // /**
      //  * Updates the Gaz'es with previous odometer and set the vehicle id on vehicle
      //  */
      // this.migrate = function() {
      //   var done = self.async(),
      //       config = data.data['src'],
      //       configD = data.data['dest'],
      //       pos = 0,
      //       prevOdometer = 0;
      //   if (!config) grunt.fail.fatal('cannot find the config: src');
      //   if (!configD) grunt.fail.fatal('cannot find the config: dest');
      //   esSrc = new elasticsearch.Client(config.src);
      //   esDest = new elasticsearch.Client(config.dest);

      //   esSrc.search({
      //     index: 'ziax',
      //     type: 'gaz',
      //     body: {
      //       "query": {
      //           "filtered": {
      //              "query": { "match_all": {} },
      //              "filter": {
      //                  "term": {
      //                     "vehicle.vendor": "volvo" // volvo or honda
      //                  }
      //              }
      //           }
      //       },
      //       "sort": [
      //          {
      //             "odometer": {
      //                "order": "asc"
      //             }
      //          }
      //       ]
      //     },
      //     size: 1000,
      //     scroll: '30s',
      //   }, function getMoreUntilDone(error, response) {
      //     if (error) grunt.fail.fatal(error);
      //     pos += response.hits.hits.length;
      //     grunt.log.writeln('Got', response.hits.hits.length, 'of', pos, '/', response.hits.total);
      //     var temp = [];
      //     response.hits.hits.forEach(function (hit) {
      //       temp.push({ update: { _index: 'ziax', _type: 'gaz', _id: hit._id } });
      //       temp.push({
      //         doc: {
      //           previousOdometer: prevOdometer,
      //           vehicle: {
      //             _id: 'v50' // v50 or st1100
      //           }
      //         }
      //       });
      //       prevOdometer = hit._source.odometer;
      //     });

      //     esDest.bulk({ body: temp }, function(esErr, esRes) {
      //       if (esErr) grunt.fail.fatal(esErr);
      //       // console.log(esRes);
      //       if (response.hits.total !== pos) {
      //         // now we can call scroll over and over
      //         esSrc.scroll({
      //           scrollId: response._scroll_id,
      //           scroll: '30s'
      //         }, getMoreUntilDone);
      //       } else {
      //         done();
      //       }
      //     });
      //   });

      // };

      this.migrateNext = function() {
        var done = self.async(),
            config = data.data['src'],
            configD = data.data['dest'],
            pos = 0,
            nextOdometer = 0;
        if (!config) grunt.fail.fatal('cannot find the config: src');
        if (!configD) grunt.fail.fatal('cannot find the config: dest');
        esSrc = new elasticsearch.Client(config.src);
        esDest = new elasticsearch.Client(config.dest);

        esSrc.search({
          index: 'ziax',
          type: 'gaz',
          body: {
            "query": {
                "filtered": {
                   "query": { "match_all": {} },
                   "filter": {
                       "term": {
                          "vehicle.vendor": "volvo" // volvo or honda
                       }
                   }
                }
            },
            "sort": [
               {
                  "odometer": {
                     "order": "desc"
                  }
               }
            ]
          },
          size: 1000,
          scroll: '30s',
        }, function getMoreUntilDone(error, response) {
          if (error) grunt.fail.fatal(error);
          pos += response.hits.hits.length;
          grunt.log.writeln('Got', response.hits.hits.length, 'of', pos, '/', response.hits.total);
          var temp = [];
          response.hits.hits.forEach(function (hit) {
            console.log(hit._source.odometer);
            temp.push({ update: { _index: 'ziax', _type: 'gaz', _id: hit._id } });
            temp.push({
              doc: {
                nextOdometer: nextOdometer,
                vehicle: {
                  _id: 'v50' // v50 or st1100
                }
              }
            });
            nextOdometer = hit._source.odometer;
          });

          esDest.bulk({ body: temp }, function(esErr, esRes) {
            if (esErr) grunt.fail.fatal(esErr);
            // console.log(esRes);
            if (response.hits.total !== pos) {
              // now we can call scroll over and over
              esSrc.scroll({
                scrollId: response._scroll_id,
                scroll: '30s'
              }, getMoreUntilDone);
            } else {
              done();
            }
          });
        });
      };

      this.deletePreviousOdometer = function() {
        var done = self.async(),
            config = data.data['src'],
            configD = data.data['dest'],
            pos = 0;

        if (!config) grunt.fail.fatal('cannot find the config: src');
        if (!configD) grunt.fail.fatal('cannot find the config: dest');
        esSrc = new elasticsearch.Client(config.src);
        esDest = new elasticsearch.Client(config.dest);

        esSrc.search({
          index: 'ziax',
          type: 'gaz',
          body: { },
          size: 1000,
          scroll: '30s',
        }, function getMoreUntilDone(error, response) {
          if (error) grunt.fail.fatal(error);
          pos += response.hits.hits.length;
          grunt.log.writeln('Got', response.hits.hits.length, 'of', pos, '/', response.hits.total);
          var temp = [];
          response.hits.hits.forEach(function (hit) {
            temp.push({ update: { _index: 'ziax', _type: 'gaz', _id: hit._id } });
            temp.push({
              script: "ctx._source.remove(\"previousOdometer\")"
            });
          });

          esDest.bulk({ body: temp }, function(esErr, esRes) {
            if (esErr) grunt.fail.fatal(esErr);
            // console.log(esRes);
            if (response.hits.total !== pos) {
              // now we can call scroll over and over
              esSrc.scroll({
                scrollId: response._scroll_id,
                scroll: '30s'
              }, getMoreUntilDone);
            } else {
              done();
            }
          });
        });


        // done();
// curl -XPOST 'localhost:9200/test/type1/1/_update' -d '{
//     "script" : "ctx._source.remove(\"text\")"
// }'

      };


      this.backup = function() {
        var done = self.async();
        var config = data.data[data.args[0]],
            indices = config.indices;

        var deleteIndicies = function(asyncDone) {
            Async.each(indices, function (item, cb) {
              grunt.log.write('deleting', item.name, '- exists: ');
              esDest.indices.exists({ index: item.name }, function(esErr, esRes) {
                if (esErr) grunt.fail.fatal(esErr);
                grunt.log.writeln(esRes);
                if (!esRes) {
                  cb();
                }
                else {
                  esDest.indices.delete({ index: item.name }, function(esErr, esRes) {
                    if (esErr) grunt.fail.fatal(esErr);
                    cb();
                  });
                }
              });
            }, function(err) {
              if (err) grunt.fail.fatal(err);
              asyncDone();
            });
          }
          , initSettingsAndMappings = function(asyncDone) {
            Async.each(indices, function(item, cb) {
              grunt.log.writeln('mapping', item.name);
              var settings = item.settings; // No mappings here.
               // console.log(item.name, settings);
              // cb();
              esDest.indices.create({ index: item.name, body: settings }, function(esErr, esRes) {
                if (esErr) grunt.fail.fatal(esErr);
                // console.log(esRes);
                cb();
              });
            }, function(err) {
              if (err) grunt.fail.fatal(err);
              asyncDone();
            });
          }
          , copyMappings = function(asyncDone) {
            grunt.log.writeln('indices');
            Async.each(indices, function (item, cb) {
              grunt.log.write('copying ', item, '- types: ');
              esSrc.indices.getMapping({ index: item.name }, function (esErr, esRes) {
                if (esErr) grunt.fail.fatal(esErr);
                var types = Object.keys(esRes[item]),
                    mappings = esRes[item];
                grunt.log.writeln(types);
                Async.each(types, function(type, cb2) {
                  // console.log(item, type, esRes);
                  var doc = {};
                  doc[type] = mappings[type];
                  // console.log(type, doc);
                  // cb2();
                  esDest.indices.putMapping({ index: item.name, type: type, body: doc }, function (esErr2, esRes2) {
                    if (esErr2) grunt.fail.fatal(esErr2);
                    grunt.log.writeln(esRes2);
                    cb2();
                  });
                }, function (err) {
                  cb();
                });
              });
            }, function(err) {
              if (err) grunt.fail.fatal(err);
              asyncDone();
            });
          }
          , copyData = function(asyncDone) {
            Async.each(indices, function(item, cb) {
              grunt.log.writeln('copying', item.name);
              var pos = 0;
              esSrc.search({
                index: item.name,
                size: 1000,
                scroll: '30s',
              }, function getMoreUntilDone(error, response) {
                if (error) grunt.fail.fatal(error);
                pos += response.hits.hits.length;
                grunt.log.writeln('Got', response.hits.hits.length, 'of', pos, '/', response.hits.total);
                var temp = [];
                response.hits.hits.forEach(function (hit) {
                  // { index:  { _index: 'myindex', _type: 'mytype', _id: 1 } },
                  temp.push({ index: { _index: hit._index, _type: hit._type, _id: hit._id } });
                  temp.push(hit._source);
                });

                esDest.bulk({ body: temp }, function(esErr, esRes) {
                  if (esErr) grunt.fail.fatal(esErr);
                  // console.log(esRes);
                  if (response.hits.total !== pos) {
                    // now we can call scroll over and over
                    esSrc.scroll({
                      scrollId: response._scroll_id,
                      scroll: '30s'
                    }, getMoreUntilDone);
                  } else {
                    cb();
                  }
                });

              });
            }, function(err) {
              if (err) grunt.fail.fatal(err);
              asyncDone();
            });
          };
          // , copySettings = function(asyncDone) {
          //   grunt.log.writeln('settings');
          //   Async.each(indices, function(item, cb) {
          //     esSrc.indices.getSettings({ index: item }, function (esErr, esRes) {
          //       if (esErr) grunt.fail.fatal(esErr);
          //       console.log(esRes);
          //       var types = Object.keys(esRes[item])
          //         , mappings = esRes[item];
          //       grunt.log.writeln(types);
          //       cb();
          //     })

          //   }, function(err) {
          //     if (err) grunt.fail.fatal(err);
          //     asyncDone();
          //   });



          // };
          // 

        if (!config) grunt.fail.fatal('cannot find the config: ' + data.args[0]);

        esSrc = new elasticsearch.Client(config.src);
        esDest = new elasticsearch.Client(config.dest);
        Async.series([ deleteIndicies, initSettingsAndMappings /*copyMappings*/, copyData ], function(err, results) {
          if (err) grunt.fail.fatal(err);
          done();
        });
      };
      
      /*         NEW        */

      function existsIndex(config, dest, done) {
        Async.eachSeries(config.indices, function (item, cb) {
          grunt.log.write('deleting', item.name, '- exists: ');
          dest.indices.exists({ index: item.name }, function(esErr, esRes) {
            if (esErr) grunt.fail.fatal(esErr);
            grunt.log.writeln(esRes);
            if (!esRes) {
              cb();
            }
            else {
              dest.indices.delete({ index: item.name }, function(esErr, esRes) {
                if (esErr) grunt.fail.fatal(esErr);
                cb();
              });
            }
          });
        }, function(err) {
          if (err) grunt.fail.fatal(err);
          done();
        });
      }

      function settingsAndMappings(config, dest, done) {
        Async.each(config.indices, function(item, cb) {
          grunt.log.writeln('settingsAndMappings:', item.name);
          var settings = item.settings;
          dest.indices.create({ index: item.name, body: settings }, function(esErr, esRes) {
            if (esErr) grunt.fail.fatal(esErr);
            cb();
          });
        }, function(err) {
          if (err) grunt.fail.fatal(err);
          done();
        });
      }

      function bulking(config, dest, done) {
        if (!config.bulk) return done();
        dest.bulk({ body: config.bulk }, function(esErr, esRes) {
          if (esErr) grunt.fail.fatal(esErr);
          done();
        });
      }

      this.play = function() {
        var done = self.async();
        var config = data.data[data.args[0]],
            dest = new elasticsearch.Client(config.dest);

        Async.applyEachSeries([ existsIndex, settingsAndMappings, bulking ], config, dest, function(err, results) {
          if (err) grunt.fail.fatal(err);
          done();
        });
      };
    };
    var utils = new EsUtils(this);
    utils[this.target]();

    // var tasks = this.data.tasks,
    //     data = this.data,
    //     client = es.createClient(data.config);

    // function es_execute (done, cmd) {
    //   var fn = client,
    //       name = cmd.key,
    //       val = cmd.val,
    //       args;
      
    //   function http_cb (err, _data) {
    //     if (err && !data.ignoreErrors) grunt.fail.fatal(err);
    //     grunt.log.ok('"' + name + '" ok');
    //     done(null, true);
    //   }

    //   name.split('.').forEach(function (parameter) {
    //     fn = fn[parameter];
    //   });
    //   if (typeof(fn) !== 'function') grunt.fail.fatal('Cannot find "' + name + '" on client');

    //   args = (Object.prototype.toString.call(val) === '[object Array]') ? val : [val];
    //   args.push(http_cb);
    //   fn.apply(fn, args);
    // };

    // this.async();
    // var map = function (item, cb) {
    //   var key = Object.getOwnPropertyNames(item)[0];
    //   var val = item[key];
    //   var fn = { key: key, val: val };
    //   cb(null,  fn);
    // };

    // var run = function (item, cb)  {
    //   // setTimeout(function() { console.log('did', item.key); cb(null, 1); }, 1000);
    //   es_execute(cb, item);
    // };

    // Async.map(tasks, map, function(err, results) {
    //     Async.eachSeries(results, run, function (err2, results2) {
    //       if (err2) grunt.fail.fatal(err2);
    //       grunt.log.ok('all done');
    //     });
    // });
  });

  function MigrateExistingDocuments(source, dest, done) {
    this.done = done;
    this.esSrc = source;
    this.esDest = dest;
  }

  MigrateExistingDocuments.prototype = _.extend(MigrateExistingDocuments, {
    test: function() {
      console.log('test', this.esSrc);
    },

    process: function(query) {
      this.esSrcQuery = query;
      this.position = 0;
      
      _.bindAll( this, 'fetchFromSource', 'handleEsData', 'result' );
      
      Async.waterfall([
        this.fetchFromSource
      ], this.result);
    },

    handleEsData: function(errorEs, respEs, next) {
      if (this.position === respEs.hits.total) return next(null, 'done');
      var _t = this;

      console.log('position', this.position);

      this.position += respEs.hits.hits.length;
      this.esSrc.scroll({ scrollId: respEs._scroll_id, scroll: '30s' }, function(e2, r2) { _t.handleEsData(e2, r2, next); });
    },

    fetchFromSource: function(next) {
      return next(null, this.esSrc.search({
        index: 'ziax',
        type: 'gaz',
        body: {
          "query": {
            "match_all": {}
          }
        },
        size: 50,
        scroll: '30s'
        }));

      // var _t = this;
      // this.esSrc.search({
      //   index: 'ziax',
      //   type: 'gaz',
      //   body: {
      //     "query": {
      //       "match_all": {}
      //     }
      //   },
      //   size: 50,
      //   scroll: '30s'
      //   }, function(e1, r1) { _t.handleEsData(e1,  r1, next); });
    },

    result: function(error, finalResult) {
      // if ( err ) {
      //   this.deferred.reject( err );
      // } else {
      //   this.deferred.resolve( currentlyPassingStudents );
      // }
      if (error) grunt.fail.fatal(error);

      console.log('result', finalResult);
      this.done();

    }

  });
};
