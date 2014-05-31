module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-http');
  return {
    http: {
      deleteAll: {
        options: {
          uri: 'http://localhost:9200/_all',
          method: 'DELETE'
        }
      },
      deleteGaz: {
        options: {
          uri: 'http://localhost:9200/ziax/gaz',
          method: 'DELETE',
          ignoreErrors: true
        }
      },
      deleteGazStations: {
        options: {
          uri: 'http://localhost:9200/gaz',
          method: 'DELETE',
          ignoreErrors: true
        }
      },
      iss: {
        options: {
          uri: 'http://localhost:8081/api/iss',
          method: 'PUT'
        }
      },
      airport: {
        options: {
          uri: 'http://localhost:8081/api/airport',
          method: 'PUT'
        }
      },

      gazStation: {
        options: {
          uri: 'http://localhost:9200/gaz/station/_bulk',
          // uri: 'http://es_user:0xziaxtre@s.ziax.dk/es/gaz/station/_bulk',
          method: 'POST',
        },
        files: {
          dest: './es/data/gaz/GasStations.json'
        }
      },
      gaz: {
        options: {
          uri: 'http://localhost:9200/ziax/gaz/_bulk',
          // uri: 'http://es_user:0xziaxtre@s.ziax.dk/es/ziax/gaz/_bulk',
          method: 'POST',
        },
        files: {
          dest: './es/data/gaz/Gas2.json'
        }
      },
      gazVehicle: {
        options: {
          uri: 'http://localhost:9200/gaz/vehicle/_bulk',
          // uri: 'http://es_user:0xziaxtre@s.ziax.dk/es/gaz/vehicle/_bulk',
          method: 'POST',
        },
        files: {
          dest: './es/data/gaz/Vehicle.json'
        }
      }
    }
  };
};
