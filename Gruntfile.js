module.exports = function (grunt) {

  function extend() {
    for (var i = 1; i < arguments.length; i += 1) {
      for (var p in arguments[i]) {
        arguments[0][p] = arguments[i][p];
      }
    }
    return arguments[0];
  }

  var compilerOptions = {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    warning_level: 'VERBOSE',
    summary_detail_level: 3,
    language_in: 'ECMASCRIPT5_STRICT',
    output_wrapper: '"(function(){%output%}());"'
  };

  var browsers = [{
    browserName: "firefox",
    version: "19",
    platform: "XP"
  }, {
    browserName: "chrome",
    platform: "XP"
  }, {
    browserName: "chrome",
    platform: "linux"
  }, {
    browserName: "internet explorer",
    platform: "WIN8",
    version: "10"
  }, {
    browserName: "internet explorer",
    platform: "VISTA",
    version: "9"
  }, {
    browserName: "opera",
    platform: "Windows 2008",
    version: "12"
  }];


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['build'],
    connect: {
      server: {
        options: {
          base: "",
          port: 9999
        }
      }
    },
    'saucelabs-mocha': {
      all: {
        options: {
          urls: ['http://127.0.0.1:9999/test/index.html'],
          tunnelTimeout: 5,
          build: process.env.TRAVIS_JOB_ID,
          concurrency: 3,
          browsers: browsers,
          tags: [process.env.TRAVIS_BRANCH],
          testname: [process.env.TRAVIS_REPO_SLUG]
        }
      }
    },
    watch: {},
    jshint: {
      all: ['src/**/*.js'],
      options: {
        // ... better written as dot notation
        "-W069": true,

        // type definitions
        "-W030": true,

        // Don't make functions within loops
        "-W083": true
      }
    },
    closurecompiler: {
      compile: {
        files: {
          "build/fontloader.js": ['src/**/*.js', 'vendor/google/base.js'],
        },
        options: extend({}, compilerOptions, {
          define: "goog.DEBUG=false"
        })
      },
      debug: {
        files: {
          "build/fontloader.debug.js": ['src/**/*.js', 'vendor/google/base.js']
        },
        options: extend({}, compilerOptions, {
          debug: true,
          formatting: ['PRETTY_PRINT', 'PRINT_INPUT_DELIMITER']
        })
      }
    }
  });

  grunt.loadNpmTasks('grunt-closurecompiler');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('compile', ['closurecompiler:compile']);
  grunt.registerTask('debug', ['closurecompiler:debug']);
  grunt.registerTask('default', ['compile']);
  grunt.registerTask('dev', ['connect', 'watch']);
  grunt.registerTask('test', ['connect', 'saucelabs-mocha']);
};
