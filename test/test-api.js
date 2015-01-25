
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
    instance = protocol().set(api, auth, logger).stream();
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

      instance.on('error', done);

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

  testCommand('must link a system',
    {"request":"system link","responseType":"response","response":{"result":"ok"}},
    'system link nscaledemo /tmp',
    function(instance, api, auth) {
      api.linkSystem = function(user, path, cwd, cb) {
        expect(path).to.eql(path);
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

  testCommand('must create a system',
    {"request":"system create","responseType":"response","response":{"id":"d59da4c1-2565-49d3-a8ee-b9c6a755f6d7"}},
    'system create abcde mynamespace /tmp',
    function(instance, api, auth) {
      api.createSystem = function(user, name, namespace, cwd, cb) {
        expect(user).to.not.be.null();
        expect(name).to.eql('abcde');
        expect(namespace).to.eql('mynamespace');
        cb(null, { id: 'd59da4c1-2565-49d3-a8ee-b9c6a755f6d7' });
      };
    }
  );

  testCommand('must create a system with quotes in the name',
    {"request":"system create","responseType":"response","response":{"id":"d59da4c1-2565-49d3-a8ee-b9c6a755f6d7"}},
    'system create "abc de" mynamespace /tmp',
    function(instance, api, auth) {
      api.createSystem = function(user, name, namespace, cwd, cb) {
        expect(name).to.eql('abc de');
        cb(null, { id: 'd59da4c1-2565-49d3-a8ee-b9c6a755f6d7' });
      };
    }
  );

  testCommand('must create a system with quotes in the path',
    {"request":"system create","responseType":"response","response":{"id":"d59da4c1-2565-49d3-a8ee-b9c6a755f6d7"}},
    'system create abc mynamespace "/tmp/ab cd"',
    function(instance, api, auth) {
      api.createSystem = function(user, name, namespace, cwd, cb) {
        expect(cwd).to.eql('/tmp/ab cd');
        cb(null, { id: 'd59da4c1-2565-49d3-a8ee-b9c6a755f6d7' });
      };
    }
  );

  testCommand('must get the deployed system',
    require(__dirname + '/fixture/deployed.json'),
    'system deployed sudc local',
    function(instance, api, auth) {
      api.getDeployedSystem = function(id, target, cb) {
        expect(id).to.eql('sudc');
        expect(target).to.eql('local');
        cb(null, require(__dirname + '/fixture/deployed.json').response);
      };
    }
  );

  testCommand('must list the containers',
    require(__dirname + '/fixture/container-list.json'),
    'container list sudc latest',
    function(instance, api, auth) {
      api.listContainers = function(id, revision, out, cb) {
        expect(id).to.eql('sudc');
        expect(revision).to.eql('latest');
        cb(null, require(__dirname + '/fixture/container-list.json').response);
      };
    }
  );

  /*
  testCommand('must build a container',
    {"request":"container build","responseType":"response","response": { result: "ok" }},
    'container build sudc abcdef',
    function(instance, api, auth) {
      api.buildContainer = function(user, systemId, containerId, out, cb) {
        expect(systemId).to.eql('sudc');
        expect(containerId).to.eql('abcdef');
        cb(null, { result: 'ok' });
      };
    }
  );
  */

  testCommand('must deploy a system',
    {"request":"revision deploy","responseType":"response","response": { }},
    'revision deploy sudc abcdef local',
    function(instance, api, auth) {
      api.deploySystem = function(user, systemId, revisionId, target, type, out, cb) {
        expect(systemId).to.eql('sudc');
        expect(revisionId).to.eql('abcdef');
        expect(target).to.eql('local');
        expect(type).to.eql('live');
        cb(null, { result: 'ok' });
      };
    }
  );

  testCommand('must analyze a system',
    {"request":"system analyze","responseType":"response","response": require(__dirname + '/fixture/deployed.json').response },
    'system analyze sudc local',
    function(instance, api, auth) {
      api.analyzeSystem = function(user, systemId, target, out, cb) {
        expect(systemId).to.eql('sudc');
        expect(target).to.eql('local');
        cb(null, require(__dirname + '/fixture/deployed.json').response);
      };
    }
  );

  testCommand('must check a system',
    {"request":"system check","responseType":"response","response": { result: "ok" }},
    'system check sudc local',
    function(instance, api, auth) {
      api.checkSystem= function(user, systemId, target, out, cb) {
        expect(systemId).to.eql('sudc');
        expect(target).to.eql('local');
        cb(null, { result: 'ok' });
      };
    }
  );

  testCommand('must mark a revision',
    {"request":"revision mark","responseType":"response","response": { result: "ok" }},
    'revision mark sudc abcdef',
    function(instance, api, auth) {
      api.checkSystem= function(user, systemId, revisionId, cb) {
        expect(systemId).to.eql('sudc');
        expect(revisionId).to.eql('abcdef');
        cb(null, { result: 'ok' });
      };
    }
  );

  testCommand('must preview a system deploy',
    {"request":"revision preview","responseType":"response","response": {}},
    'revision preview sudc abcdef local',
    function(instance, api, auth) {
      api.previewSystemDeploy = function(user, systemId, revisionId, target, out, cb) {
        expect(systemId).to.eql('sudc');
        expect(revisionId).to.eql('abcdef');
        expect(target).to.eql('local');
        cb(null, { result: 'ok' });
      };
    }
  );

  testCommand('must list the revisions',
    require(__dirname + '/fixture/revision-list.json'),
    'revision list sudc',
    function(instance, api, auth) {
      api.listRevisions = function(id, cb) {
        expect(id).to.eql('sudc');
        cb(null, require(__dirname + '/fixture/revision-list.json').response);
      };
    }
  );

  testCommand('must get a revision',
    require(__dirname + '/fixture/revision-get.json'),
    'revision get sudc abcdef dev',
    function(instance, api, auth) {
      api.getRevision = function(id, rev, env, cb) {
        expect(id).to.eql('sudc');
        expect(rev).to.eql('abcdef');
        expect(env).to.eql('dev');
        cb(null, require(__dirname + '/fixture/revision-get.json').response);
      };
    }
  );

  testCommand('must list the timeline',
    require(__dirname + '/fixture/timeline-list.json'),
    'timeline list sudc',
    function(instance, api, auth) {
      api.timeline = function(id, cb) {
        expect(id).to.eql('sudc');
        cb(null, require(__dirname + '/fixture/timeline-list.json').response);
      };
    }
  );
});
