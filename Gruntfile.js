module.exports = function(grunt) {
  var src = ['src/color.js', 'src/protocol.js'];

  grunt.initConfig({
    concat: {
      options: {
        separator: ';',
        banner: '(function(exports) {',
        footer: '})(typeof exports === "undefined" ? this.weeChat = {} : exports)'
      },
      dist: {
        src: src,
        dest: 'weechat.js'
      }
    },
    jasmine: {
      pivotal: {
        src: 'weechat.js',
        options: {
          specs: 'spec/*Spec.js'
        }
      }
    },
    jshint: {
      all: src
    },
    uglify: {
      my_target: {
        files: {
          'weechat.min.js': 'weechat.js'
        }
      }
    },
    watch: {
      scripts: {
        files: ['src/*.js', 'spec/*.js'],
        tasks: ['default']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'jshint', 'jasmine', 'uglify']);
  grunt.registerTask('dev', ['default', 'watch']);
};
