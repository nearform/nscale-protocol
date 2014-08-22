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

  var login = function(out, username, password, cb) {
    auth.login(username, password, function(err, result) {
      if (err) {
        return cb(err)
      }
      if (result.user) {
        out.connection.user = result.user;
      }
      out.response(result);
    });
  };


  var token = function(out, token, cb) {
    auth.userInfo(token, function(err, user) {
      if (err) { return cb(err); }
      out.connection.user = user;
      out.response(user);
      cb();
    });
  };


  var authorized = function(connection, out) {
    if (!connection.user) {
      out.response({ok:false, err:'Unauthorized'});
    }
    return connection.user;
  };



  var githubLogin = function(out, accessToken, cb) {
    auth.githubLogin(accessToken, function(err, result) {
      if (err) { return cb(err); }
      if (result.user) {
        out.connection.user = result.user;
      }
      out.response(result);
      cb();
    });
  };



  var listSystems = function(out, cb) {
    api.listSystems(function(err, systems) {
      if (err) { return cb(err); }

      logger.info('rsp: list systems');
      out.response(systems);
      cb();
    });
  };



  var createSystem = function(out, name, namespace, cb) {
    api.createSystem(out.connection.user, name, namespace, function(err, system) {
      if (err) {
        return cb(err);
      }
      logger.info('rsp: create system');
      out.response(system);
      cb();
    });
  };



  var getSystem = function(out, systemId, cb) {
    api.getHeadSystem(systemId, function(err, system) {
      logger.info('rsp: get system ' + systemId);
      if (err) {
        return cb(err);
      }
      out.response(system);
      cb();
    });
  };



  var getDeployed = function(out, systemId, cb) {
    api.getDeployedSystem(systemId, function(err, system) {
      if (err) {
        return cb(err);
      }
      logger.info('rsp: get deployed ' + systemId);
      out.response(system);
      cb();
    });
  };



  var putSystem = function(out, systemJson, cb) {
    api.putSystem(out.connection.user, systemJson, function(err) {
      logger.info('rsp: put system');
      if (err) {
        return cb(err);
      }
      out.response({result: 'ok'});
      cb();
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



  var cloneSystem = function(out, url, cb) {
    api.cloneSystem(out.connection.user, url, function(err) {
      logger.info('rsp: clone system');
      if (err) {
        return cb(err);
      }
      out.response({result: 'ok'});
      cb();
    });
  };



  var syncSystem = function(out, systemId, cb) {
    api.syncSystem(out.connection.user, systemId, function(err) {
      logger.info('rsp: sync system');
      if (err) {
        return cb(err);
      }
      out.response({result: 'ok'});
      cb()
    });
  };



  var addRemote = function(out, systemId, url, cb) {
    api.addRemote(out.connection.user, systemId, url, function(err) {
      logger.info('rsp: add remote');
      if (err) {
        return cb(err);
      }
      out.response({result: 'ok'});
      cb();
    });
  };



  var listContainers = function(out, systemId, cb) {
    api.listContainers(systemId, function(err, containers) {
      logger.info('rsp: list containers ' + systemId);
      if (err) {
        return cb(err);
      }
      out.response(containers);
      cb();
    });
  };



  //var addContainer = function(out, user, containerJson, systemId) {
  //  api.addContainer(user, systemId, containerJson, function(err) {
  //    logger.info('rsp: add container');
  //    if (err) { out.response({result: 'err', err: err}); }
  //    else { out.response({result: 'ok'}); }
  //  });
  //};



  //var putContainer = function(out, user, containerJson, systemId) {
  //  api.putContainer(user, systemId, containerJson, function(err) {
  //    logger.info('rsp: put container');
  //    if (err) { out.response({result: 'err', err: err}); }
  //    else { out.response({result: 'ok'}); }
  //  });
  //};



  //var deleteContainer = function(out, user, systemId, containerId) {
  //  api.deleteContainer(user, systemId, containerId, function(err) {
  //    logger.info('rsp: delete container');
  //    if (err) { out.response({result: 'err', err: err}); }
  //    else { out.response({result: 'ok'}); }
  //  });
  //};



  var buildContainer = function(out, systemId, containerId, cb) {
    api.buildContainer(out.connection.user, systemId, containerId, out, function(err, result) {
      logger.info('rsp: build container ' + systemId);
      if (err) {
        return cb(err);
      }
      out.response(result);
      cb();
    });
  };



  var deploySystem = function(out, systemId, revisionId, cb) {
    var user = out.connection.user;
    api.deploySystem(user, systemId, revisionId, 'live', out, function(err, result) {
      logger.info('rsp: deploy system ' + user + ' ' + systemId + ' ' + revisionId);
      if (err) {
        return cb(err);
      }
      out.response(result);
      cb();
    });
  };



  var analyzeSystem = function(out, systemId, cb) {
    var user = out.connection.user;
    api.analyzeSystem(user, systemId, out, function(err, result) {
      logger.info('rsp: analyze system ' + user + ' ' + systemId);
      if (err) {
        return cb(err);
      }
      out.response(result);
      cb();
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



  var quitConnection = function(out, cb) {
    logger.info('rsp: quit');
    out.response({bye: 'bye!'}, function() {
      out.connection.end();
      cb();
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
      //delete: deleteContainer,
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
      //var req = (command + ' ' + args.join(' ')).trim();
      var req = command;
      var out = netOut(stream, req, logger)
      var authorizedUser = authorized(stream, out);
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);

      args.unshift(out);
      args.push(cb);
      func.apply(null, args);
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
      var out = netOut(stream, req, logger)
      logger.info('rcv: ' + req);

      args.unshift(out);
      args.push(cb);
      handlersUnauthorized[cmd].apply(null, args);
    });
  });


  var handlersMultiline = {
    'system put': putSystem,
    //'container add': addContainer,
    //'container put': putContainer
  };

  Object.keys(handlersMultiline).forEach(function(cmd) {
    _server.register(cmd, { multiline: 'END' }, function(args, stream, multiline, cb) {
      //var req = cmd + ' ' + args.join(' ');
      var req = cmd;
      var out = netOut(stream, req, logger)
      var authorizedUser = authorized(stream, out);
      if (!authorizedUser) {return;}
      logger.info('rcv: ' + req);

      args.unshift(out);
      args.push(multiline);
      args.push(cb);
      handlersMultiline[cmd].apply(null, args);
    });
  })


  return {
    stream: function() {

      var stream = _server.stream();

      stream.on('commandError', function(cmd, args, err) {
        logger.error(err);
        args[0].response({result: 'err', err: err});
        stream.end();
      });

      return stream;
    }
  };
};

