module.exports = function(grunt) {
  return {
    conftransform: {
      build: {
        src: '_config.json',
        dest: 'build/_config.json',
        config: {
          es: {
            production: {
              host: "http://localhost:9200"
            }
          }
        }
      }
    }
  };
};
