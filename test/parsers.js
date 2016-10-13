var chai = require('chai');
var expect = chai.expect;
var parsers = require('../lib/parsers');
var win32 = parsers.win32;
var linux = parsers.linux;
var darwin = parsers.darwin;

var line = null;

describe('Parsers', function () {
    describe('linux', function () {

        beforeEach(function () {
            line = 'tcp        0      0 2.2.5.144:35507    1.2.3.4:80      ESTABLISHED 7777/foo';
        });

        it('should parse the correct fields', function () {
            linux.call(null, line, function (data) {
                expect(data).to.deep.equal({
                    protocol: 'tcp',
                    local: {
                        address: '2.2.5.144',
                        port: 35507
                    },
                    remote: {
                        address: '1.2.3.4',
                        port: 80
                    },

                    state: 'ESTABLISHED',
                    pid: 7777
                });
            });
        });

        it('should parse the correct fields for processes with spaces in names', function () {
            line = 'tcp        0      0 2.2.5.144:35507      1.2.3.4:80     ESTABLISHED 7777/sshd: user';

            linux.call(null, line, function (data) {
                expect(data).to.deep.equal({
                    protocol: 'tcp',
                    local: {
                        address: '2.2.5.144',
                        port: 35507
                    },
                    remote: {
                        address: '1.2.3.4',
                        port: 80
                    },

                    state: 'ESTABLISHED',
                    pid: 7777
                });
            });
        });
    });

    describe('darwin', function () {
        beforeEach(function () {
            line = 'tcp4       0      0  10.59.107.171.55383    17.146.1.14.443        ESTABLISHED 262144 131400    312      0';
        });

        it('should parse the correct fields', function () {
            darwin.call(null, line, function (data) {
                expect(data).to.deep.equal({
                    protocol: 'tcp',
                    local: {
                        address: '10.59.107.171',
                        port: 55383
                    },
                    remote: {
                        address: '17.146.1.14',
                        port: 443
                    },

                    state: 'ESTABLISHED',
                    pid: 312
                });
            });
        });
    });

    describe('win32', function () {
        beforeEach(function () {
            line = 'TCP    2.2.5.144:1454     1.2.3.4:80        CLOSE_WAIT      7777';
        });

        it('should parse the correct fields', function () {
            win32.call(null, line, function (data) {
                expect(data).to.deep.equal({
                    protocol: 'tcp',
                    local: {
                        address: '2.2.5.144',
                        port: 1454
                    },
                    remote: {
                        address: '1.2.3.4',
                        port: 80
                    },

                    state: 'CLOSE_WAIT',
                    pid: 7777
                });
            });
        });
    });
});