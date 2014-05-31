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
          method: 'POST',
        },
        files: {
          dest: './es/GasStations.json'
        }
      },
      gaz: {
        options: {
          uri: 'http://localhost:9200/ziax/gaz/_bulk',
          method: 'POST',
        },
        files: {
          dest: './es/Gas2.json'
        }
      },
      gazVehicle: {
        options: {
          uri: 'http://localhost:9200/gaz/vehicle/_bulk',
          method: 'POST',
        },
        files: {
          dest: './es/Vehicle.json'
        }
      }
    }
  };
};
