
var expect = require('must');
var protocol = require('../lib/main');
var MockApi = require('./mock-api');
var MockAuth = require('./mock-auth');
var net = require('net');

describe('tcp access', function() {
  var instance;
  var api;
  var auth;
  var logger = {
    info: function() {},
    error: function() {}
  }
  var server;

  beforeEach(function(done) {
    api = new MockApi();
    auth = new MockAuth();
    server = protocol(api, auth, logger).start();
    server.on('listening', function() {
      instance = net.connect({ host: 'localhost', port: 3223 });
      done();
    })
  });

  it('must handle unknown commands', function(done) {

    instance.on('data', function(data) {
      expect(data.toString()).to.eql('no such command\n');
      done();
    });

    instance.write('unknown command\n')
  });
});
