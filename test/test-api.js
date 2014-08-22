
var expect = require('must');
var protocol = require('../lib/main');
var MockApi = require('./mock-api');
var MockAuth = require('./mock-auth');

describe('protocol api', function() {
  var instance;
  var api;
  var auth;
  var logger = {
    info: function() {},
    error: function() {}
  }

  beforeEach(function(done) {
    api = new MockApi();
    auth = new MockAuth();
    instance = protocol(api, auth, logger).stream();
    instance.write('token abcde\n'); // we authenticate
    instance.resume(); // swallow token response
    process.nextTick(done);
  });

  function testCommand(name, expected, command, pre) {
    it(name, function(done) {

      if (pre) {
        pre(instance, api, auth);
      }


      instance.on('data', function(data) {
        expect(data.toString().trim()).to.eql(JSON.stringify(expected));
        done();
      });

      instance.write(command + '\n');
    });
  }

  testCommand('must list systems with no systems',
    {"request":"system list","responseType":"response","response":[]},
    'system list'
  );

  testCommand('must clone a system',
    {"request":"system clone","responseType":"response","response":{"result":"ok"}},
    'system clone git@github.com:pelger/sudc.git'
  );

  testCommand('must list a system',
    {"request":"system list","responseType":"response","response":[{"name":"sudc","id":"f0033600-36aa-4820-8006-83e90cc20e5e"}]},
    'system list',
    function(instance, api, auth) {
      api.listSystems = function(cb) {
        cb(null, [{"name":"sudc","id":"f0033600-36aa-4820-8006-83e90cc20e5e"}]);
      };
    }
  );
});
