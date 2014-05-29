module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-htmlrefs');
  return {
    htmlrefs: {
      build: {
        /** @required  - string including grunt glob variables */
        src: 'build/src/index.html',
        /** @optional  - string directory name*/
        //dest: 'build/src',
        /** @optional  - references external files to be included */
        /*includes: {
          analytics: './ga.inc' // in this case it's google analytics (see sample below)
        },*/
        /** any other parameter included on the options will be passed for template evaluation */
        options: {
          buildNumber: '<%= buildno %>'
        }
      }
    },
    // template: {
    //   build: {
    //     options: {
    //       data: function () {
    //         return {
    //           build: grunt.option('build')
    //         }
    //       }
    //     },
    //       src: 'build/src/index.html',
    //       dest: 'build/src/index.html'
    //   }
    // },
  };
};
