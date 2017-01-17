"use strict";

var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var emitLines = require('./utils').emitLines;
var parseLines = require('./utils').parseLines;

exports._spawnSync = spawnSync;
exports._spawn = spawn;

exports.sync = function (cmd, args, makeLineHandler, done, watch) {
    var processing = true;
    var lineHandler = makeLineHandler(function () {
        processing = false;
    });

    do {
        var proc = exports._spawnSync(cmd, args);
        if (proc.error) {
            return done(proc.error);
        } else {
            var lines = parseLines(proc.stdout);
            for (var i = 0; i < lines.length && processing; i++) {
                lineHandler(lines[i]);
            }

            if (!processing || !watch) {
                return done(null);
            }
        }
    } while (true);
};

exports.async = function (cmd, args, makeLineHandler, done, watch) {
    var killed = false;
    var proc = exports._spawn(cmd, args);
    var lineHandler = makeLineHandler(function () {
        proc.stdout.removeListener('line', lineHandler);
        proc.kill();
        killed = true;
    });

    var doneCheck = function (err) {
        if (err || killed || !watch) {
            return done(err);
        }

        if (watch) {
            setTimeout(function () {
                exports.async(cmd, args, makeLineHandler, done, watch);
            }, 0);
        }
    };

    emitLines(proc.stdout);
    proc.on('close', function () {
        doneCheck(null);
    });
    
    proc.on('error', doneCheck);
    proc.stdout.on('line', lineHandler);
};