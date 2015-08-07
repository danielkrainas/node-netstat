"use strict";

var os = require('os');


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

    if (!options.sync && options.limit && options.limit > 0) {
        handler = filters.limit(handler, options.limit, stopParsing);
    }

    if (options.filter) {
        handler = filters.conditional(handler, options.filter);
    }

    if(options.sync){
        var spawnSync = require('child_process').spawnSync;
        proc = spawnSync(command.cmd, command.args);
        var backlog = proc.stdout.toString()
        
        var n = backlog.indexOf('\n');
        var iLine=0
        while (~n) {
            lineListener(backlog.substring(0, n))
            if(options.limit && options.limit > 0 && ++iLine > options.limit){break;} 
            backlog = backlog.substring(n + 1);
            n = backlog.indexOf('\n');
        }

        
    } else {
        var spawn = require('child_process').spawn;
        proc = spawn(command.cmd, command.args);
        emitLines(proc.stdout);
        proc.on('exit', done);
        proc.on('error', doneHandler);
        proc.stdout.on('line', lineListener);
        
        
    }
};

exports.commands = commands;
exports.filters = filters;
exports.parsers = parsers;
exports.version = pkg.version;
