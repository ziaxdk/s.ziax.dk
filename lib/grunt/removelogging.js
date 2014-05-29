module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-remove-logging");
  return {
    removelogging: {
      build: {
        // src: "dist/**/*.js" // Each file will be overwritten with the output!
        src: ['build/src/js/*.js'/*, 'build/src/js/lib-ext/*.js'*/],
        options: {

        }
      }
      // dist: {
      //   src: "build/src/js/ziaxdash.all.min.js",
      //   dest: "build/src/js/ziaxdash.all.min.js",

      //   options: {
      //     // see below for options. this is optional.
      //   }
      // }
    }
  };
};
