
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


      instance.once('data', function(data) {
        expect(data.toString().trim()).to.eql(JSON.stringify(expected));
        instance.write('quit\n');
        instance.once('data', function(data) {
          expect(data.toString().trim()).to.eql(JSON.stringify({"request":"quit","responseType":"response","response":{"bye":"bye!"}}));
          done();
        })
      });

      instance.write(command + '\n');
    });

    it('must support errors for ' + command, function(done) {
      api.nextError = new Error('this should happen')

      instance.once('data', function(data) {
        instance.on('data', function(data) {
          expect(data.toString()).to.eql('Error: this should happen\n');
          done();
        });
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
    'system clone git@github.com:pelger/sudc.git',
    function(instance, api, auth) {
      api.cloneSystem = function(user, url, cb) {
        expect(url).to.eql('git@github.com:pelger/sudc.git');
        expect(user).to.not.be.null();
        cb(null);
      };
    }
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

  testCommand('must sync a system',
    {"request":"system sync","responseType":"response","response":{"result":"ok"}},
    'system sync sudc',
    function(instance, api, auth) {
      api.syncSystem = function(user, id, cb) {
        expect(user).to.not.be.null();
        expect(id).to.eql('sudc');
        cb(null);
      };
    }
  );

  testCommand('must get the deployed system',
    require(__dirname + '/fixture/deployed.json'),
    'system deployed sudc',
    function(instance, api, auth) {
      api.getDeployedSystem = function(id, cb) {
        expect(id).to.eql('sudc');
        cb(null, require(__dirname + '/fixture/deployed.json').response);
      };
    }
  );

  testCommand('must get the head revision of a system',
    {"request":"system get","responseType":"response","response": require(__dirname + '/fixture/deployed.json').response },
    'system get sudc',
    function(instance, api, auth) {
      api.getHeadSystem = function(id, cb) {
        expect(id).to.eql('sudc');
        cb(null, require(__dirname + '/fixture/deployed.json').response);
      };
    }
  );
});