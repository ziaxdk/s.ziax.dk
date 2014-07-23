module.exports = function(grunt) {
  var Config = require('../../_config.json');
  grunt.loadTasks('lib/tasks/grunt-elasticsearch.js');
  return {
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
            { name: 'ziax', settings: grunt.file.readJSON('es/setup.json') /* ignoreData: [ 'airport' ] TODO: Need to be implemented*/ },
            { name: 'gaz', settings: grunt.file.readJSON('es/setup-gaz.json') }
            // { name: 'aviation', settings: grunt.file.readJSON('es/setup-aviation.json') }
          ],
          src: Config.es.production,
          dest: Config.es.development
        },
        dev2prod: {
          indices: [
            { name: 'ziax', settings: grunt.file.readJSON('es/setup.json') },
            { name: 'gaz', settings: grunt.file.readJSON('es/setup-gaz.json') }
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
        gaz: {
          indices: [
            { name: 'gaz', settings: grunt.file.readJSON('es/setup-gaz.json') }
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
      },
      // migrate: {
      //   src: Config.es.development,
      //   dest: Config.es.development,
      // },
      migrateNext: {
        src: Config.es.development,
        dest: Config.es.development,
      },
      deletePreviousOdometer: {
        src: Config.es.development,
        dest: Config.es.development
      }
    }
  };
};
