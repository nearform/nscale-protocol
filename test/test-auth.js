
var expect = require('must');
var protocol = require('../lib/main');
var MockApi = require('./mock-api');
var MockAuth = require('./mock-auth');

describe('protocol authorization', function() {
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

  it('must fail logins', function(done) {

    var messages = [
      JSON.stringify({"request":"login","responseType":"stderr","stderr":{},"level":"error"}),
      "Error: no such user"
    ]

    auth.login = function(user, pass, callback) {
      callback(new Error('no such user'));
    };

    instance.on('data', function(data) {
      expect(data.toString().trim()).to.eql(messages.shift());
    });

    instance.on('end', done);

    instance.write('login matteo mypass\n');
  });

  it('must authenticate with a token', function(done) {
    instance.on('data', function(data) {
      expect(data.toString().trim()).to.eql(JSON.stringify({"request":"token","responseType":"response","response":{"user":{"name":"mocked user"}}}));
      done()
    })
    instance.write('token abcde\n')
  })

  it('must fail auth token', function(done) {

    var messages = [
      JSON.stringify({"request":"token","responseType":"stderr","stderr":{},"level":"error"}),
      "Error: no such user"
    ]

    auth.userInfo = function(token, callback) {
      callback(new Error('no such user'));
    };

    instance.on('data', function(data) {
      expect(data.toString().trim()).to.eql(messages.shift());
    });

    instance.on('end', done);

    instance.write('token abcde\n');
  });
});
