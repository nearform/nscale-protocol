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


  // disabled by @mcollina
  //var deleteSystem = function(out, user, systemId) {
  //  api.deleteSystem(user, systemId, function(err) {
  //    logger.info('rsp: delete system');
  //    if (err) { out.response({result: 'err', err: err}); }
  //    else { out.response({result: 'ok'}); }
  //  });
  //};



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



  var handlers = {
    login: login,
    githubLogin: githubLogin,
    token: token,
    authorized: authorized,
    quit: quitConnection,

    revision: {
      list: listRevisions,
      get: getRevision,
      mark: markRevision,
      preview: previewSystemDeploy
    },

    system: {
      list: listSystems,
      get: getSystem,
      create: createSystem,
      deployed: getDeployed,
      put: putSystem,
      deploy: deploySystem,
      analyze: analyzeSystem,
      check: checkSystem,
      sync: syncSystem,
      clone: cloneSystem,
      //disabled by @mcollina
      //delete: deleteSystem
    },

    container: {
      list: listContainers,
      add: addContainer,
      put: putContainer,
      delete: deleteContainer,
      build: buildContainer
    },

    timeline: {
      list: timeline
    },

    remote: {
      add: addRemote
    }
  };



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

    function buildCategoryHandler(category) {
      _server.on(category, function(connection, action, a, b){
        var req = category + ' ' + action;
        var authorizedUser = handlers.authorized(connection, netOut(connection, req));
        if (!authorizedUser) {return;}
        logger.info('rcv: ' + req);
        handlers[category][action](netOut(connection, req), authorizedUser, a, b);
      });
    }

    buildCategoryHandler('revision')
    buildCategoryHandler('system')
    buildCategoryHandler('container')
    buildCategoryHandler('timeline')
    buildCategoryHandler('remote')


    logger.info('starting protocol...');
    _server.start();
  };



  construct();
  return {
  };
};

