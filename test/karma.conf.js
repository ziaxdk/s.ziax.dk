// Karma configuration
// Generated on Mon Jun 30 2014 15:32:09 GMT+0200 (Romance Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    // urlRoot: '.',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        '../src/bower_components/jquery/dist/jquery.js',
        '../src/bower_components/angular/angular.js',
        '../src/bower_components/angular-mocks/angular-mocks.js',
        '../src/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
        'ng-module-init.js',
         '../src/js/app/dir/zInputs.js',
        './tests/**/*test.js'

        // 'bower_components/jquery/dist/jquery.js',
        // 'bower_components/angular/angular.js',
        // 'bower_components/angular-mocks/angular-mocks.js',
        // 'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
        // '5/directives.js',
        // '5/services.js',
        // '5/filters.js',
        // '5/tests/**/*spec.js'
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [ 'Chrome' ],
    // browsers: ['Chrome', 'Firefox', 'IE'],
    // browsers: ['sl_ios_safari'],
    // browsers: ['bs_ie8_win7'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,


    // sauceLabs: {
    //     username: 'ziaxdk',
    //     accessKey: process.env.SAUCE_LABS_ACCESS_KEY,
    //     testName: 'NG Airline'
    // },

    // // browserStack: {
    // //   username: 'kenneth32',
    // //   accessKey: process.env.BROWSER_STACK_ACCESS_KEY
    // // },

    // customLaunchers: {
    //     // bs_ie8_win7: {
    //     //     base: 'BrowserStack',
    //     //     browser: 'IE',
    //     //     browser_version: '8.0',
    //     //     os: 'Windows',
    //     //     os_version: '7'
    //     // },
    //     // bs_firefox_win7: {
    //     //     base: 'BrowserStack',
    //     //     browser: 'firefox',
    //     //     browser_version: '24.0',
    //     //     os: 'Windows',
    //     //     os_version: '7'
    //     // },
    //     // bs_chrome_win7: {
    //     //     base: 'BrowserStack',
    //     //     browser: 'chrome',
    //     //     browser_version: '29.0',
    //     //     os: 'Windows',
    //     //     os_version: '7'
    //     // },
    //     // bs_ff_mac: {
    //     //     base: 'BrowserStack',
    //     //     browser: 'firefox',
    //     //     browser_version: 'latest',
    //     //     os: 'Windows',
    //     //     os_version: 'XP'
    //     // },
    //     // bs_ch_mac: {
    //     //     base: 'BrowserStack',
    //     //     browser: 'chrome',
    //     //     browser_version: 'latest',
    //     //     os: 'OS X',
    //     //     os_version: 'Lion'
    //     // },

    //     sl_chrome_win7: {
    //         base: 'SauceLabs',
    //         browserName: 'chrome',
    //         platform: 'Windows 7'
    //     },
    //     sl_firefox_osx: {
    //         base: 'SauceLabs',
    //         browserName: 'firefox',
    //         version: '27'
    //     },
    //     sl_ios_safari: {
    //         base: 'SauceLabs',
    //         browserName: 'iphone',
    //         platform: 'OS X 10.9',
    //         version: '7.1'
    //     },
    //     sl_ie_11_win81: {
    //         base: 'SauceLabs',
    //         browserName: 'internet explorer',
    //         platform: 'Windows 8.1',
    //         version: '11'
    //     }
    // }


  });
};

