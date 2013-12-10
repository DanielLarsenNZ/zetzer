/*
 * grunt-stencil
 * https://github.com/cambridge-healthcare/grunt-stencil
 *
 * Copyright (c) 2013 Cambridge Healthcare
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function (grunt) {
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-shell");

  grunt.loadTasks("tasks");

  grunt.registerTask("default", ["test", "jshint"]);
  grunt.registerTask("test", ["clean", "shell:jasmine"]);
  grunt.registerTask("testv", ["clean", "shell:jasmine_verbose"]);

  // Project configuration.
  grunt.initConfig({

    stencil: {
      fixtures: {
        options: {
          partials: "spec/includes",
          templates: "spec/templates",
          template_map: [{
            files: "*_default",
            template: "default"
          }],
          dot_template_settings: {
            strip: true
          },
          env: {
            parameter: "value"
          }
        },
        files: [{
          expand: true,
          cwd: "spec/fixtures",
          src: "*.html",
          dest: "tmp",
          ext: ".html",
          flatten: true
        }]
      }
    },

    jshint: {
      all: [
        "Gruntfile.js",
        "tasks/*.js",
        "lib/*.js"
      ],
      options: {
        jshintrc: ".jshintrc",
      },
    },

    shell: {
      options: {
        stdout: true
      },
      jasmine: {
        command: "node_modules/.bin/jasmine-node spec"
      },
      jasmine_verbose: {
        command: "node_modules/.bin/jasmine-node --verbose spec"
      }
    },

    clean: {
      tmp: ["tmp"],
    }
  });
};
