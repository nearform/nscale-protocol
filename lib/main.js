/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * ndf command protocol
 *
 * list systems
 * list container systemid
 *
 *
 */

'use strict';

var cmdsrv = require('cmdsrv');
var netOut = require('./networkOut');
var auth = require('nfd-auth')();

var logger = require('winston');


module.exports = function(api) {
  var _server;


  var login = function(connection, username, password) {
    var out = netOut(connection, 'login ' + username);
    auth.login(username, password, function(err, result) {
      if (err) {
        logger.error(err);
        out.stderr(err);
        return out.response(result);
      }
      if (result.user) {
        connection.user = result.user;
      }
      out.response(result);
    });
  };


  var token = function(connection, token) {
    var out = netOut(connection, 'token ' + token);
    auth.userInfo(token, function(err, user) {
      if (err) {return out.stderr(err);}
      connection.user = user;
      out.response(connection.user);
    });
  };


  var authorized = function(connection, out) {
    if (!connection.user) {
      out.response({ok:false, err:'Unauthorized'});
    }
    return connection.user;
  };



  var githubLogin = function(connection, accessToken) {
    var out = netOut(connection, 'githublogin');
    auth.githubLogin(accessToken, function(err, result) {
      if (err) {logger.error(err); return out.stderr(err);}
      if (result.user) {
        connection.user = result.user;
      }
      out.response(result);
    });
  };



  var listSystems = function(out, user) {
    api.listSystems(function(err, systems) {
      logger.info('rsp: list systems');
      console.log(JSON.stringify(systems, null, 2));
      out.response(systems);
    });
  };



  var createSystem = function(out, user, name, namespace) {
    api.createSystem(user, name, namespace, function(err, system) {
      logger.info('rsp: create system');
      out.response(system);
    });
  };



  var getSystem = function(out, user, systemId) {
    api.getHeadSystem(systemId, function(err, system) {
      logger.info('rsp: get system ' + systemId);
      out.response(system);
    });
  };



  var getDeployed = function(out, user, systemId) {
    api.getDeployedSystem(systemId, function(err, system) {
      logger.info('rsp: get deployed ' + systemId);
      out.response(system);
    });
  };



  var putSystem = function(out, systemJson, user/*, systemId*/) {
    api.putSystem(user, systemJson, function(err) {
      logger.info('rsp: put system');
      if (err) {
        out.response({result: 'err', err: err});
      }
      else {
        out.response({result: 'ok'});
      }
    });
  };



  var deleteSystem = function(out, user, systemId) {
    api.deleteSystem(user, systemId, function(err) {
      logger.info('rsp: delete system');
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };



  var cloneSystem = function(out, user, url) {
    api.cloneSystem(user, url, function(err) {
      logger.info('rsp: clone system');
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };



  var syncSystem = function(out, user, systemId) {
    api.syncSystem(user, systemId, function(err) {
      logger.info('rsp: sync system');
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };



  var addRemote = function(out, url, user, systemId) {
    api.addRemote(user, systemId, url, function(err) {
      logger.info('rsp: add remote');
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };



  var listContainers = function(out, user, systemId) {
    api.listContainers(systemId, function(err, containers) {
      logger.info('rsp: list containers ' + systemId);
      out.response(containers);
    });
  };



  var addContainer = function(out, user, containerJson, systemId) {
    api.addContainer(user, systemId, containerJson, function(err) {
      logger.info('rsp: add container');
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };



  var putContainer = function(out, user, containerJson, systemId) {
    api.putContainer(user, systemId, containerJson, function(err) {
      logger.info('rsp: put container');
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };



  var deleteContainer = function(out, user, systemId, containerId) {
    api.deleteContainer(user, systemId, containerId, function(err) {
      logger.info('rsp: delete container');
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };



  var buildContainer = function(out, user, systemId, containerId) {
    api.buildContainer(user, systemId, containerId, out, function(err, result) {
      logger.info('rsp: build container ' + systemId);
      out.response(result);
    });
  };



  var deploySystem = function(out, user, systemId, revisionId) {
    api.deploySystem(user, systemId, revisionId, 'live', out, function(err, result) {
      logger.info('rsp: deploy system ' + user + ' ' + systemId + ' ' + revisionId);
      out.response(result);
    });
  };



  var analyzeSystem = function(out, user, systemId) {
    api.analyzeSystem(user, systemId, out, function(err, result) {
      logger.info('rsp: analyze system ' + user + ' ' + systemId);
      out.response(result);
    });
  };


  var checkSystem = function(out, user, systemId) {
    api.checkSystem(user, systemId, function(err, result) {
      logger.info('rsp: check system ' + user + ' ' + systemId);
      out.response(result);
    });
  };


  var markRevision = function(out, user, systemId, revisionId) {
    api.markRevision(user, systemId, revisionId, function(err, result) {
      logger.info('rsp: mark revision ' + user + ' ' + systemId + ' ' + revisionId);
      out.response(result);
    });
  };



  var deployAll = function(out, user, systemId, revisionId) {
    api.deployAll(systemId, revisionId, out, function(err) {
      logger.info('rsp: deploy all' + systemId + ' ' + revisionId);
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };



  var previewSystemDeploy = function(out, user, systemId, revisionId) {
    api.previewSystemDeploy(user, systemId, revisionId, out, function(err, result) {
      logger.info('rsp: deploy system ' + user + ' ' + systemId + ' ' + revisionId);
      out.response(result);
    });
  };



  var listRevisions = function(out, user, systemId) {
    api.listRevisions(systemId, function(err, result) {
      logger.info('rsp: list revisions ' + systemId);
      out.response(result);
    });
  };



  var getRevision = function(out, user, systemId, revisionId) {
    api.getRevision(systemId, revisionId, function(err, result) {
      logger.info('rsp: get revision ' + systemId);
      out.response(result);
    });
  };



  var timeline = function(out, user, systemId) {
    api.timeline(systemId, function(err, result) {
      logger.info('rsp: timeline');
      out.response(result);
    });
  };



  var quitConnection = function(connection, out) {
    logger.info('rsp: quit');
    out.response({bye: 'bye!'}, function() {
      connection.end();
    });
  };



  var handlers = {login: login,
                  githubLogin: githubLogin,
                  token: token,
                  authorized: authorized,
                  list: { systems: listSystems,
                          containers: listContainers,
                          revisions: listRevisions,
                          timeline: timeline},
                  create: {system: createSystem},
                  get: {system: getSystem, revision: getRevision, deployed: getDeployed},
                  add: {container: addContainer, remote: addRemote},
                  put: {system: putSystem, container: putContainer},
                  mark: {revision: markRevision },
                  delete: {system: deleteSystem, container: deleteContainer},
                  build: { container: buildContainer},
                  deploy: { system: deploySystem, all: deployAll},
                  analyze: { system: analyzeSystem },
                  check: { system: checkSystem },
                  preview: { system: previewSystemDeploy},
                  clone: {system: cloneSystem},
                  sync: {system: syncSystem},
                  quit: quitConnection };

  /**
   * construct the server
   */
  var construct = function() {
    _server = new cmdsrv();

    var mode = 'command';
    var put = '';
    var lineTarget;
    var lineUser;
    var lineId;

    _server.on('login', function(connection, username, password){
      logger.info('rcv: login ' + username);
      handlers.login(connection, username, password);
    });

    _server.on('githublogin', function(connection, accessToken){
      logger.info('rcv: githublogin');
      handlers.githubLogin(connection, accessToken);
    });

    _server.on('token', function(connection, token){
      logger.info('rcv: token ' + token);
      handlers.token(connection, token);
    });

    _server.on('list', function(connection, target, systemId, containerId){
      var req = 'list ' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);
      handlers.list[target](netOut(connection, req), authorizedUser, systemId, containerId);
    });

    _server.on('create', function(connection, target, name, namespace){
      var req = 'create ' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);
      handlers.create[target](netOut(connection, 'create ' + target), authorizedUser, name, namespace);
    });

    _server.on('get', function(connection, target, systemId, otherId){
      var req = 'get ' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);
      handlers.get[target](netOut(connection, 'get ' + target), authorizedUser, systemId, otherId);
    });

    _server.on('delete', function(connection, target, systemId, containerId){
      var req = 'delete ' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);
      handlers.delete[target](netOut(connection, 'delete ' + target), authorizedUser, systemId, containerId);
    });

    _server.on('add', function(connection, target, id) {
      var req = 'add ' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);

      mode = 'lineAdd';
      put = '';
      lineTarget = target;
      //lineUser = authorizedUser.id;
      lineUser = authorizedUser;
      lineId = id;
    });

    _server.on('put', function(connection, target, id){
      var req = 'put ' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);

      mode = 'linePut';
      put = '';
      lineTarget = target;
      //lineUser = authorizedUser.id;
      lineUser = authorizedUser;
      lineId = id;
    });

    _server.on('build', function(connection, target, systemId, containerId){
      var req = 'build ' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);
      handlers.build[target](netOut(connection, 'build ' + target), authorizedUser, systemId, containerId);
    });

    _server.on('deploy', function(connection, target, systemId, revisionId){
      var req = 'deploy ' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);
      handlers.deploy[target](netOut(connection, 'deploy ' + target), authorizedUser, systemId, revisionId);
    });

    _server.on('analyze', function(connection, target, systemId){
      var req = 'analyze ' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);
      handlers.analyze[target](netOut(connection, 'analyze ' + target), authorizedUser, systemId);
    });

    _server.on('check', function(connection, target, systemId){
      var req = 'check ' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);
      handlers.check[target](netOut(connection, 'check ' + target), authorizedUser, systemId);
    });

    _server.on('mark', function(connection, target, systemId, revisionId){
      var req = 'mark ' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);
      handlers.mark[target](netOut(connection, 'mark ' + target), authorizedUser, systemId, revisionId);
    });

    _server.on('preview', function(connection, target, systemId, revisionId){
      var req = 'preview' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);
      handlers.preview[target](netOut(connection, 'preview ' + target), authorizedUser, systemId, revisionId);
    });

    _server.on('clone', function(connection, target, url){
      var req = 'clone' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);
      handlers.clone[target](netOut(connection, 'clone ' + target), authorizedUser, url);
    });

    _server.on('sync', function(connection, target, systemId){
      var req = 'sync' + target;
      var authorizedUser = handlers.authorized(connection, netOut(connection, req));
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);
      handlers.sync[target](netOut(connection, 'sync ' + target), authorizedUser, systemId);
    });

    _server.on('quit', function(connection){
      logger.info('rcv: quit');
      handlers.quit(connection, netOut(connection, 'quit'));
    });

    _server.on('line', function(connection, line) {
      if (mode === 'linePut') {
        if (line.indexOf('END') !== -1) {
          mode = 'command';
          handlers.put[lineTarget](netOut(connection, 'put ' + lineTarget), put, lineUser, lineId);
        }
        else {
          put += line;
        }
      }
      if (mode === 'lineAdd') {
        if (line.indexOf('END') !== -1) {
          mode = 'command';
          handlers.add[lineTarget](netOut(connection, 'add ' + lineTarget), put, lineUser, lineId);
        }
        else {
          put += line;
        }
      }
    });

    logger.info('starting protocol...');
    _server.start();
  };



  construct();
  return {
  };
};

