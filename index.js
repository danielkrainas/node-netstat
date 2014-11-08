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

function normalizeValues (item) {
    item.protocol = item.protocol.toLowerCase();
    var parts = item.local.split(':');
    item.local = {
        address: parts[0],
        port: parts[1] || null
    };

    parts = item.remote.split(':');
    item.remote = {
        address: parts[0],
        port: parts[1] || null
    };

    if (item.local.address == '0.0.0.0') {
        item.local.address = '*';
    }

    if (item.program == '-') {
        item.program = null;
    } else {
        parts = item.program.split('/');
        item.program = {
            pid: parts.length == 2 ? parts[0] : 0,
            name: parts[1] || parts[0] 
        };
    }

    return item;
}

var parsers = {
    linux: function (stdout, callback) {
        stdout.on('line', function (line) {
            var parts = line.split(/\s/).filter(String);
            if (!parts.length || parts[0] != 'tcp' || parts.length != 7) {
                return;
            }

            var item = {
                protocol: parts[0],
                sendq: parts[1],
                recvq: parts[2],
                local: parts[3],
                remote: parts[4],
                state: parts[5],
                program: parts[6]
            };

            callback(normalizeValues(item));
        });
    },

    win32: function (stdout, callback) {

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

module.exports = exports = function (callback) {
    var platform = os.platform();
    var command = commands[platform];
    var parser = parsers[platform];
    var proc = spawn(command.cmd, command.args);
    emitLines(proc.stdout);
    parser(proc.stdout, callback);
};
