module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  return {
    cssmin: {
      build: {
        files: [
          {
            expand: true,
            src: [
              'build/src/css/*.css',
              'build/src/bower_components/leaflet/dist/leaflet.css'
            ],
            ext: '.min.css'
          }
        ]
      }
    }
  };
};
