var os = require('os'),
    spawn = require('child_process').spawn;

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

function parseAddress (raw) {
    var port = null,
        address = null;
    if (raw[0] == '[') {
        port = raw.substring(raw.lastIndexOf(':') + 1);
        address = raw.substring(1, raw.indexOf(']'));
    } else if (raw.indexOf(':') != raw.lastIndexOf(':')) {
        port = raw.substring(raw.lastIndexOf(':') + 1);
        address = raw.substring(0, raw.lastIndexOf(':'));
    } else {
        var parts = raw.split(':');
        port = parts[1];
        address = parts[0] || null;
    }

    if (address && (address == '::' || address == '0.0.0.0')) {
        address = null;
    }
    
    return {
        port: port,
        address: address
    };
}

function normalizeValues (item) {
    item.protocol = item.protocol.toLowerCase();
    var parts = item.local.split(':');
    item.local = parseAddress(item.local);
    item.remote = parseAddress(item.remote);
    
    /*if (!item.local.address) {
        item.local.address = '*';
    }*/

    if (item.protocol == 'tcp' && ~item.local.address.indexOf(':')) {
        item.protocol = 'tcp6';
    }

    if (item.pid == '-') {
        item.pid = 0;
    } else if (~item.pid.indexOf('/')) {
        parts = item.pid.split('/');
        item.pid = parts.length == 2 ? parts[0] : 0;
    } else if (isNaN(item.pid)) {
        item.pid = 0;
    }

    return item;
}

var parsers = {
    linux: function (line, callback) {
        var parts = line.split(/\s/).filter(String);
        if (!parts.length || parts.length != 7) {
            return;
        }

        var item = {
            protocol: parts[0],
            local: parts[3],
            remote: parts[4],
            state: parts[5],
            pid: parts[6]
        };

        callback(normalizeValues(item));
    },

    win32: function (line, callback) {
        var parts = line.split(/\s/).filter(String);
        if (!parts.length || parts.length != 5) {
            return;
        }

        var item = {
            protocol: parts[0],
            local: parts[1],
            remote: parts[2],
            state: parts[3],
            pid: parts[4]
        };
        
        console.log(item);

        callback(normalizeValues(item));
    }
};

function emitLines (stream) {
    var backlog = ''
    stream.on('data', function (data) {
        backlog += data
        var n = backlog.indexOf('\n')
        // got a \n? emit one or more 'line' events
        while (~n) {
            stream.emit('line', backlog.substring(0, n));
            backlog = backlog.substring(n + 1);
            n = backlog.indexOf('\n');
        }
    });

    stream.on('end', function () {
        if (backlog) {
            stream.emit('line', backlog);
        }
    });
}

module.exports = exports = function (options, callback) {
    var platform = os.platform();
    var command = commands[platform];
    var parser = parsers[platform];
    if (!parser || !command) {
        throw new Error('platform is not supported.');
    }

    var proc = spawn(command.cmd, command.args);
    emitLines(proc.stdout);
    proc.stdout.on('line', function (line) {
        parser(line, callback);
    });
};
