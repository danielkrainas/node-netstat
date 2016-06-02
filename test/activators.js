var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require("sinon-chai"));
var EventEmitter = require('events').EventEmitter;

var activators = require('../lib/activators');

var data = require('./data');
var testData = data.join('\n');

var makeLineHandler = function (stopHandler) {
    return lineHandler || function () {};
};

var lineHandler = null;
var proc = null;

describe('Activators', function () {    
    describe('asynchronous', function () {
        beforeEach(function () {
            lineHandler = null;

            proc = new EventEmitter();
            proc.stdout = new EventEmitter();

            sinon.stub(activators, '_spawn').returns(proc);
        });

        afterEach(function () {
            activators._spawn.restore();
        });

        it('should call the line handler for each line present in the child processes stdout', function (done) {
            lineHandler = sinon.spy();

            activators.async('', '', makeLineHandler, function () {
                expect(lineHandler).to.have.callCount(data.length);
                done();
            });

            proc.stdout.emit('data', testData);
            proc.stdout.emit('end');
            proc.emit('close');
        });

        it('should call done when processing is complete', function (done) {
            lineHandler = sinon.spy();

            activators.async('', '', makeLineHandler, function () {
                expect(lineHandler).to.have.callCount(data.length);
                done();
            });

            proc.stdout.emit('data', testData);
            proc.stdout.emit('end');
            proc.emit('close');
        });

        it('should return an error if the child process encounters one', function (done) {
            var error = new Error('test error');

            activators.async('', '', makeLineHandler, function (err) {
                expect(err).to.equal(error);
                done();
            });

            proc.emit('error', error);
        });
    });

    describe('synchronous', function () {
        beforeEach(function () {
            lineHandler = null;
            proc = {
                error: null,
                stdout: testData
            };

            sinon.stub(activators, '_spawnSync').returns(proc);
        });

        afterEach(function () {
            activators._spawnSync.restore();
        });

        it('should call the line handler for each line present in the child processes stdout', function () {
            lineHandler = sinon.spy();

            activators.sync('', '', makeLineHandler, function () {});

            expect(lineHandler).to.have.callCount(data.length);
        });

        it('should call done when processing is complete', function () {
            lineHandler = sinon.spy();
            var done = sinon.spy();

            activators.sync('', '', makeLineHandler, done);

            expect(lineHandler).to.have.callCount(data.length);
            expect(done).to.have.been.called;
        });

        it('should return an error if the child process encounters one', function () {
            proc.error = new Error('test error');
            var done = sinon.spy();

            activators.sync('', '', makeLineHandler, done);

            expect(done).to.have.been.calledWith(proc.error);
        });
    });
});