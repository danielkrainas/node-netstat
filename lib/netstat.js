"use strict";

var os = require('os');
var spawn = require('child_process').spawn;
var emitLines = require('./utils').emitLines;
var noop = require('./utils').noop;
var parsers = require('./parsers');
var filters = require('./filters');
var pkg = require('../package');

var commands = {
    linux: {
        cmd: 'netstat',
        args: ['-apn', '--tcp']
    },
    win32: {
        cmd: 'netstat',
        args: ['-a', '-n', '-o']
    }
};

module.exports = function (options, callback) {
    options = options || {};
    var doneHandler = options.done || noop;
    var platform = options.platform || os.platform();
    var command = commands[platform];
    var parser = parsers[platform];
    var proc = null;
    var handler = callback;
    var lineListener = function (line) {
        parser(line, handler);
    };

    var stopParsing = function () {
        proc.stdout.removeListener('line', lineListener);
        proc.kill();
    };

    var done = function () {
        doneHandler(null);
    };

    // doesn't need to do anything more than pass on the error right now
    var errored = doneHandler;

    if (!parser || !command) {
        throw new Error('platform is not supported.');
    }

    if (options.limit && options.limit > 0) {
        handler = filters.limit(handler, options.limit, stopParsing);
    }

    if (options.filter) {
        handler = filters.conditional(handler, options.filter);
    }

    proc = spawn(command.cmd, command.args);
    emitLines(proc.stdout);
    proc.on('exit', done);
    proc.on('error', doneHandler);
    proc.stdout.on('line', lineListener);
};

exports.commands = commands;
exports.filters = filters;
exports.parsers = parsers;
exports.version = pkg.version;