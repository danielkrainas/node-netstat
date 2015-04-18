var parseAddress = exports.parseAddress = function (raw) {
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
        port: port ? parseInt(port) : null,
        address: address
    };
};

exports.normalizeValues = function (item) {
    item.protocol = item.protocol.toLowerCase();
    var parts = item.local.split(':');
    item.local = parseAddress(item.local);
    item.remote = parseAddress(item.remote);
    
    /*if (!item.local.address) {
        item.local.address = '*';
    }*/

    if (item.protocol == 'tcp' && item.local.address && ~item.local.address.indexOf(':')) {
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

    item.pid = parseInt(item.pid);
    return item;
};

exports.emitLines = function (stream) {
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
};