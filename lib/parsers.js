"use strict";

var normalizeValues = require('./utils').normalizeValues;

exports.linux = function (line, callback) {
    var parts = line.split(/\s/).filter(String);
    if (!parts.length || parts.length < 7) {
        return;
    }

    var pid = parts.slice(6, parts.length).join(" ");

    var item = {
        protocol: parts[0],
        local: parts[3],
        remote: parts[4],
        state: parts[5],
        pid: pid
    };

    return callback(normalizeValues(item));
};

exports.darwin = function (line, callback) {
    var parts = line.split(/\s/).filter(String);
    if (!parts.length || parts.length != 10) {
        return;
    }

    var item = {
        protocol: parts[0] == 'tcp4' ? 'tcp' : parts[0],
        local: parts[3],
        remote: parts[4],
        state: parts[5],
        pid: parts[8]
    };

    return callback(normalizeValues(item));
};

exports.win32 = function (line, callback) {
    var parts = line.split(/\s/).filter(String);
    if (!parts.length || (parts.length != 5 && parts.length != 4)) {
      return;
    };

    var item = {
        protocol: parts[0],
        local: parts[1],
        remote: parts[2],
        state: parts[3] || null,
        pid: parts[parts.length - 1]
    };

    return callback(normalizeValues(item));
};
