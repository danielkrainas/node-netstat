var defaultCommands = {
    linux: {
        cmd: 'netstat',
        args: ['-apn', '--tcp']
    },
    darwin: {
        cmd: 'netstat',
        args: ['-v', '-n', '-p', 'tcp']
    },
    win32: {
        cmd: 'netstat',
        args: ['-a', '-n', '-o']
    }
};

module.exports = defaultCommands;
