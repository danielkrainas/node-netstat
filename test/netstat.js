var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var assert = require('assert');

chai.use(require("sinon-chai"));

var netstat = require('../lib/netstat');
var activators = require('../lib/activators');

var data = require('./data');

describe('Netstat', function () {

    describe('done should get a complete array response' , function (){
    
	it('should return an array for a particualar sync command', function (done) {
          netstat({
	    sync: true,
	    commands: {
	      linux: {
	        cmd: 'netstat',
		args: '-lntu'
	      }   
	    },
	    done: function (data) {
              assert.equal(Array.isArray(data), true);
	      done();
	    }
	  })	
	})

	it('should return an array for a particualar async command', function (done) {
          netstat({
	    sync: false,
	    commands: {
	      linux: {
	        cmd: 'netstat',
		args: '-lntu'
	      }   
	    },
	    done: function (data) {
              assert.equal(Array.isArray(data), true);
	      done();
	    }
	  })
	});
    })

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
