
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

  function testMultiLineCommand(name, expected, command, data, pre) {
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
      instance.write(JSON.stringify(data));
      instance.write('\nEND\n');
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
      instance.write(JSON.stringify(data));
      instance.write('\nEND\n');
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

  testCommand('must create a system',
    {"request":"system create","responseType":"response","response":{"id":"d59da4c1-2565-49d3-a8ee-b9c6a755f6d7"}},
    'system create abcde mynamespace',
    function(instance, api, auth) {
      api.createSystem = function(user, name, namespace, cb) {
        expect(user).to.not.be.null();
        expect(name).to.eql('abcde');
        expect(namespace).to.eql('mynamespace');
        cb(null, { id: 'd59da4c1-2565-49d3-a8ee-b9c6a755f6d7' });
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

  testCommand('must add a remote to a system',
    {"request":"remote add","responseType":"response","response":{"result":"ok"}},
    'remote add sudc git@github.com:pelger/sudc.git',
    function(instance, api, auth) {
      api.addRemote = function(user, id, url, cb) {
        expect(id).to.eql('sudc');
        expect(url).to.eql('git@github.com:pelger/sudc.git');
        expect(user).to.not.be.null();
        cb(null);
      };
    }
  );

  testCommand('must list the containers',
    require(__dirname + '/fixture/container-list.json'),
    'container list sudc',
    function(instance, api, auth) {
      api.listContainers = function(id, cb) {
        expect(id).to.eql('sudc');
        cb(null, require(__dirname + '/fixture/container-list.json').response);
      };
    }
  );

  testMultiLineCommand('must put a system',
    {"request":"system put","responseType":"response","response":{ result: "ok" }},
    'system put',
    require('./fixture/system.json'),
    function(instance, api, auth) {
      api.putSystem = function(user, system, cb) {
        expect(user).to.not.be.null();
        expect(JSON.parse(system)).to.eql(require('./fixture/system.json'));
        cb(null);
      };
    }
  );

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

  testCommand('must deploy a system',
    {"request":"system deploy","responseType":"response","response": { result: "ok" }},
    'system deploy sudc abcdef',
    function(instance, api, auth) {
      api.deploySystem = function(user, systemId, revisionId, type, out, cb) {
        expect(systemId).to.eql('sudc');
        expect(revisionId).to.eql('abcdef');
        expect(type).to.eql('live');
        cb(null, { result: 'ok' });
      };
    }
  );

  testCommand('must analyze a system',
    {"request":"system analyze","responseType":"response","response": require(__dirname + '/fixture/deployed.json').response },
    'system analyze sudc',
    function(instance, api, auth) {
      api.analyzeSystem = function(user, systemId, out, cb) {
        expect(systemId).to.eql('sudc');
        cb(null, require(__dirname + '/fixture/deployed.json').response);
      };
    }
  );

  testCommand('must check a system',
    {"request":"system check","responseType":"response","response": { result: "ok" }},
    'system check sudc',
    function(instance, api, auth) {
      api.checkSystem= function(user, systemId, cb) {
        expect(systemId).to.eql('sudc');
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
    {"request":"revision preview","responseType":"response","response": { result: "ok" }},
    'revision preview sudc abcdef',
    function(instance, api, auth) {
      api.previewSystemDeploy = function(user, systemId, revisionId, out, cb) {
        expect(systemId).to.eql('sudc');
        expect(revisionId).to.eql('abcdef');
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
});
