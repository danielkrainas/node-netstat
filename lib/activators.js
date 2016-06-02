"use strict";

var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var emitLines = require('./utils').emitLines;
var parseLines = require('./utils').parseLines;

exports._spawnSync = spawnSync;
exports._spawn = spawn;

exports.sync = function (cmd, args, makeLineHandler, done) {
    var processing = true;
    var lineHandler = makeLineHandler(function () {
        processing = false;
    });

    var proc = exports._spawnSync(cmd, args);
    if (proc.error) {
        done(proc.error);
    } else {
        var lines = parseLines(proc.stdout);
        for (var i = 0; i < lines.length && processing; i++) {
            lineHandler(lines[i]);
        }

        done(null);
    }
};

exports.async = function (cmd, args, makeLineHandler, done) {
    var proc = exports._spawn(cmd, args);
    var lineHandler = makeLineHandler(function () {
        proc.stdout.removeListener('line', lineHandler);
        proc.kill();
    });

    emitLines(proc.stdout);
    proc.on('close', function () {
        done(null);
    });
    
    proc.on('error', done);
    proc.stdout.on('line', lineHandler);
};