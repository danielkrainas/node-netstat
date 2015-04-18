var os = require('os');
var spawn = require('child_process').spawn;
var emitLines = require('./utils').emitLines;
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

module.exports = exports = function (options, callback) {
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

    if (!parser || !command) {
        throw new Error('platform is not supported.');
    }

    options = options || {};

    if (options.limit && options.limit > 0) {
        handler = filters.limit(handler, options.limit, stopParsing);
    }

    if (options.filter) {
        handler = filter.conditional(handler, options.filter);
    }

    proc = spawn(command.cmd, command.args);
    emitLines(proc.stdout);
    proc.stdout.on('line', lineListener);
};

exports.commands = commands;
exports.filters = filters;
exports.parsers = parsers;
exports.version = pkg.version;