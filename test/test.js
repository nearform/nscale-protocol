
var expect = require('must');
var protocol = require('../lib/main');
var MockApi = require('./mock-api');
var MockAuth = require('./mock-auth');

describe('protocol with mocks', function() {
  var instance;
  var api;
  var auth;
  var logger = {
    info: function() {},
    error: function() {}
  }

  beforeEach(function() {
    api = new MockApi();
    auth = new MockAuth();
    instance = protocol(api, auth, logger).stream();
  });

  it('must handle unknown commands', function(done) {

    instance.on('data', function(data) {
      expect(data.toString()).to.eql('no such command\n');
      done();
    });

    instance.write('unknown command\n')
  });

  it('must support login', function(done) {

    auth.login = function(user, pass, callback) {
      var result = {
        user: {
          name: 'matteo'
        }
      };
      callback(null, result);
    };

    instance.on('data', function(data) {
      expect(data.toString().trim()).to.eql(JSON.stringify({
        request: 'login',
        responseType: 'response',
        response: {
          user: {
            name: 'matteo'
          }
        }
      }));
      done();
    });

    instance.write('login matteo mypass\n')
  });
});
