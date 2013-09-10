'use strict';
var _ = require('underscore');
var grunt = require('grunt');
var dot = require('dot');
var METADATA_CONTENT_SEPARATOR = '\n\n';

module.exports = {
  chunks: chunks,
  compile_dot: compile_dot,
  content: content,
  contains_meta_data: contains_meta_data,
  expand_file_lists: expand_file_lists,
  extract_content: extract_content,
  extract_meta_data: extract_meta_data,
  find_closest_match: find_closest_match,
  fold_fns: fold_fns,
  meta_data: meta_data,
  parse_meta_data: parse_meta_data,
  prepare_it_obj: prepare_it_obj,
  try_and_report: try_and_report,
  validate_mapping: validate_mapping
};

function chunks (src) {
  return src.split(METADATA_CONTENT_SEPARATOR);
}

function compile_dot (template_settings, input_file, it) {
  var src = grunt.file.read(input_file);
  _.extend(dot.templateSettings, template_settings);
  return try_and_report(function () {
    return dot.template(content(src))(it);
  }, 'Error processing template of', input_file);
}

function content (src) {
  return contains_meta_data(src) ? extract_content(chunks(src)) : src;
}

function contains_meta_data (src) {
  return src[0] === '{';
}

function expand_file_lists (file_lists) {
  var expanded_lists = {};

  // _.each to iterate over object instead of array
  _.each(file_lists, function(value, key) {
    expanded_lists[key] = grunt.file.expand(value[0], value[1]);
  });

  return expanded_lists;
}

function extract_content (chunks) {
  return chunks.slice(1).join(METADATA_CONTENT_SEPARATOR);
}

function extract_meta_data (chunks) {
  return chunks[0];
}

// Return a filepath given a folder to look in,
// and a relative path which may or may not contain an extension
function find_closest_match (folder, rel_path) {
  var separator = folder.length ? '/' : '';
  var extension = has_extension(rel_path) ? '' : '.*';
  var pattern = folder + separator + rel_path + extension;
  return grunt.file.expand(pattern);
}

function fold_fns () {
  return Array.prototype.reduce.call(arguments, function (arg, fn) {
    return fn(arg);
  });
}

// Attempt to extract an extension from a filepath
// and return whether it has a length
function has_extension (path) {
  return path.match(/\.[0-9a-z]+$/i).length;
}

function meta_data (input_file) {
  var src = grunt.file.read(input_file);
  return try_and_report(function () {
    return contains_meta_data(src) ? fold_fns(src,
                                              chunks,
                                              extract_meta_data,
                                              parse_meta_data)
                                   : {};
  }, 'Error parsing JSON header in', input_file);
}

function parse_meta_data (meta_data_str) {
  return JSON.parse(meta_data_str);
}

function prepare_it_obj (given_it) {
  // Expand values in file_lists
  given_it.file_lists = expand_file_lists(given_it.file_lists);
  return given_it;
}

function try_and_report (action, error_message, path) {
  path = path || '';
  try {
    return action();
  } catch (e) {
    grunt.log.errorlns(error_message.red + ' ' + path.cyan);
    throw e;
  }
}

function validate_mapping (mapping) {
  if (mapping.src.length > 1) {
    grunt.fail.warn("You are attempting to compile a single output file " +
                    "from several input files.\nEither amend the src declaration," +
                    "or use a dynamic file mapping instead.");
  }
}