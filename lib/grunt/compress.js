module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-compress');
  return {
    // deploy to www.ziax.dk
    compress: {
      main: {
        options: {
          archive: 'zip/ziaxdash.tgz'
        },
        expand: true,
        cwd: 'build/',
        src: [ '**/*']
      }
    }
  };
};
