var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
chai.use(require("sinon-chai"));

var netstat = require('../lib/netstat');
var activators = require('../lib/activators');

var data = require('./data');

describe('Netstat', function () {
    describe('processing', function () {
        var lineHandler = null;

        beforeEach(function () {
            lineHandler = null;

            sinon.stub(activators, 'async', function (cmd, args, makeLineHandler, done) {
                var stop = sinon.spy();
                var handler = makeLineHandler(stop);
                data.forEach(function (line) {
                    if (!stop.called) {
                        handler(line);
                    }
                });

                done();
            });
        });

        afterEach(function () {
            activators.async.restore();
        });

	it('should return the line/lines for a particular command', function (done) {
          netstat({
	    watch: false,
	    sync: true,
	    commands: {
	      linux: {
	        cmd: 'netstat',
		args: '-lntu'
	      }   
	    },
	    handler: function (data) {
	      console.log(data);
	    }
	  })	
	  done(); 
	})

        it('should stop when returned false by data handler', function (done) {
            var handler = sinon.stub();
            handler.onCall(data.length - 2).returns(false);

            netstat({
                platform: 'win32',
                done: function (err) {
                    expect(handler).to.have.callCount(data.length - 1);
                    done();
                }
            }, handler);
        });
    });
});
