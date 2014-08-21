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

var bcksrv = require('bcksrv');
var netOut = require('./networkOut');

module.exports = function(api, auth, logger) {

  var login = function(out, username, password) {
    auth.login(username, password, function(err, result) {
      if (err) {
        logger.error(err);
        out.stderr(err);
        return out.response(result);
      }
      if (result.user) {
        out.connection.user = result.user;
      }
      out.response(result);
    });
  };


  var token = function(out, token) {
    auth.userInfo(token, function(err, user) {
      if (err) {return out.stderr(err);}
      out.connection.user = user;
      out.response(connection.user);
    });
  };


  var authorized = function(connection, out) {
    if (!connection.user) {
      out.response({ok:false, err:'Unauthorized'});
    }
    return connection.user;
  };



  var githubLogin = function(out, accessToken) {
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

  function forEachHandler(current, base, callback) {
    if (typeof current === 'function') {
      callback = current;
      current = handlers;
      base = "";
    }
    Object.keys(current).forEach(function(key) {
      var newBase = base + key + ' '
      if (typeof current[key] === 'function') {
        callback(newBase.trim(), current[key])
      } else {
        forEachHandler(current[key], newBase, callback)
      }
    })
  }

  var _server = new bcksrv();

  forEachHandler(function(command, func) {
    _server.register(command, function(args, stream, cb) {
      var req = command + ' ' + args.join(' ');
      var out = netOut(stream, req)
      var authorizedUser = authorized(stream, out);
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);

      args.unshift(out);
      args.push(cb);
      try {
        func.apply(null, args);
      } catch(err) {
        console.log(err, err.stack)
        cb(err);
      }
    })
  });

  var handlersUnauthorized = {
    login: login,
    githubLogin: githubLogin,
    token: token,
    quit: quitConnection
  };

  Object.keys(handlersUnauthorized).forEach(function(cmd) {
    _server.register(cmd, function(args, stream, cb) {
      var req = cmd;
      var out = netOut(stream, req)
      logger.info('rcv: ' + req);

      args.unshift(out);
      args.push(cb);
      try {
        handlersUnauthorized[cmd].apply(null, args);
      } catch(err) {
        console.log(err, err.stack)
        cb(err);
      }
    });
  });


  var handlersMultiline = {
    'system put': putSystem,
    'container add': addContainer,
    'container put': putContainer
  };

  Object.keys(handlersMultiline).forEach(function(cmd) {
    _server.register(cmd, { multiline: 'END' }, function(args, stream, multiline, cb) {
      var req = cmd + ' ' + args.join(' ');
      var out = netOut(stream, req)
      var authorizedUser = authorized(stream, out);
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);

      args.unshift(out);
      args.unshift(multiline);
      args.push(cb);
      try {
        handlersMultiline[cmd].apply(null, args);
      } catch(err) {
        console.log(err, err.stack)
        cb(err);
      }
    });
  })

  return _server;
};

