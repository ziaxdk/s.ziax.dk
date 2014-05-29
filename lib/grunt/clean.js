module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  return {
    clean: {
      build: ["build/*"],
      build_post: [ 'build/src/js/lib/**/*', '!build/src/js/lib/satellite.min.js', 'build/src/js/app/**/*' ],
      deploy: ["zip/*"]
    }
  };
};
