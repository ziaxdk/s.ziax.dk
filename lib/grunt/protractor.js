module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-protractor-runner');
  return {
    protractor: {
      options: {
        configFile: "node_modules/protractor/referenceConf.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      prod: {
        options: {
          configFile: "protractor-prod-conf.js", // Target-specific config file
          args: {} // Target-specific arguments
        }
      },
      sauce: {
        options: {
          configFile: "protractor-prod-conf.js",
          args: {
            // seleniumAddress: 'http://ondemand.saucelabs.com/wd/hub',
            // capabilities: {
            //   name: 'Search! e2e tests',
            //   username: 'ziaxdk',
            //   accessKey: 'c0e42249-4167-406e-aa39-656895ab1387',
            //   browserName: 'internet explorer',
            //   version: '9',
            //   platform: 'Windows 7'
            // }
            seleniumAddress: 'http://hub.browserstack.com/wd/hub',
            capabilities: {
              name: 'Search! e2e tests',
              'browserstack.user': 'kenneth32',
              'browserstack.key': '4YFa9e2BmsGq4jRCCc8s',
              'browserName' : 'android',
              'platform' : 'ANDROID',
              'device' : 'HTC One X',
              'browserstack.debug': true
              // version: '9',
              // platform: 'Windows 7'
            }
          }
        }
      }
    }
  };
};
