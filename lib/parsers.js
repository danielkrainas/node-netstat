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
    if (!parts.length) {
      return
    };

    var item = { };

    if (parts.length == 4 || parts.length == 5) {
      item.protocol = parts.shift();
      item.local = parts.shift();
      item.remote = parts.shift();
      item.pid = parts.pop();
      item.state = parts[0] || null;
    } else {
      return;
    }

    return callback(normalizeValues(item));
};
