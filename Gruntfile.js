module.exports = function (grunt) {
  require('google-closure-compiler').grunt(grunt);
  var extend = require('extend');

  var compilerOptions = {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    warning_level: 'VERBOSE',
    summary_detail_level: 3,
    language_in: 'ECMASCRIPT5_STRICT',
    output_wrapper: '(function(){%output%}());',
    use_types_for_optimization: true
  };

  var src = [
    'polyfill.js',
    'src/**/*.js',
    'node_modules/cssvalue/src/**/*.js',
    'node_modules/closure-fetch/src/**/*.js',
    'node_modules/closure-dom/src/**/*.js',
    'node_modules/fontfaceobserver/src/**/*.js'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['build'],
    exec: {
      test: 'phantomjs node_modules/mocha-phantomjs-core/mocha-phantomjs-core.js test/index.html',
      deps: 'calcdeps -p ' + src.map(function (p) { return p.replace('**/*.js', ''); }).join(' -p ' ) + ' -p ./vendor/google/base.js -o deps > test/deps.js'
    },
    jshint: {
      all: ['src/**/*.js'],
      options: {
        // ... better written as dot notation
        "-W069": true,

        // type definitions
        "-W030": true,

        // Don't make functions within loops
        "-W083": true,

        // Wrap the /regexp/ literal in parens to disambiguate the slash operator
        "-W092": true
      }
    },
    'closure-compiler': {
      compile: {
        files: {
          "build/fontloader.js": src
        },
        options: extend({}, compilerOptions)
      },
      debug: {
        files: {
          "build/fontloader.debug.js": src
        },
        options: extend({}, compilerOptions, {
          debug: true,
          formatting: ['PRETTY_PRINT', 'PRINT_INPUT_DELIMITER']
        })
      }
    },
    concat: {
      dist: {
        src: ['node_modules/promis/promise.js', 'build/fontloader.js'],
        dest: 'fontloader.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('compile', ['closure-compiler:compile']);
  grunt.registerTask('debug', ['closure-compiler:debug']);
  grunt.registerTask('default', ['compile']);
  grunt.registerTask('test', ['exec:test']);
  grunt.registerTask('deps', ['exec:deps']);
  grunt.registerTask('dist', ['closure-compiler:compile', 'concat:dist']);
};
