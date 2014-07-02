module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-copy');
  return {
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
          },
          // Fontawesome
          {
            expand: true,
            cwd: 'src/bower_components/fontawesome',
            src: [ 'fonts/**' ],
            dest: 'build/src/'
          },
          // Leaflet
          {
            expand: true,
            cwd: 'src/bower_components/leaflet/dist',
            src: [ 'images/**' ],
            dest: 'build/src/css/'
          },
          // Leaflet-awesome markers
          {
            expand: true,
            cwd: 'src/bower_components/Leaflet.awesome-markers/dist/',
            src: [ 'images/**' ],
            dest: 'build/src/css/'
          },
          // Bootstrap
          {
            expand: true,
            cwd: 'src/bower_components/bootstrap/dist',
            src: [ 'fonts/**' ],
            dest: 'build/src/'
          },
          {
            expand: true,
            cwd: 'src/bower_components/bootstrap/dist/css',
            src: [ '**.min.css' ],
            dest: 'build/src/css/'
          }
        ]
      }
    }
  };
};
