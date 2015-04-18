"use strict";

exports.limit = function (callback, limit, stop) {
    var count = 0;
    return function (item) {
        if (++count <= limit) {
            callback.call(this, item);
        } else {
            stop();
        }
    };
};

exports.conditional = function (callback, conditions) {
    return function (item) {
        var ok = true;
        for (var k in conditions) {
            if (!item[k] || item[k] !== conditions[k]) {
                ok = false;
                break;
            }
        }

        if (ok) {
            callback.call(this, item);
        }
    };
};