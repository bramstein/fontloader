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
    output_wrapper: '"(function(){%output%}());"',
    use_types_for_optimization: true
  };

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
    watch: {},
    exec: {
      test: {
        command: 'browserstack-test -u $BROWSERSTACK_USERNAME -p $BROWSERSTACK_PASSWORD -k $BROWSERSTACK_KEY -b browsers.json http://localhost:9999/test/index.html'
      }
    },
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
      dist: {
        files: {
          "fontloader.js": ['src/**/*.js', 'vendor/google/base.js']
        },
        options: extend({}, compilerOptions, {
          define: "goog.DEBUG=false"
        })
      },
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
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('compile', ['closurecompiler:compile']);
  grunt.registerTask('debug', ['closurecompiler:debug']);
  grunt.registerTask('default', ['compile']);
  grunt.registerTask('test', ['connect', 'exec:test']);
  grunt.registerTask('dev', ['connect', 'watch']);
  grunt.registerTask('dist', ['closurecompiler:dist']);
};
