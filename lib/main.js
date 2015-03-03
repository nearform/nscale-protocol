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
 * list systems
 * list container systemid
 */

'use strict';

var bcksrv = require('bcksrv');
var netOut = require('./networkOut');
var net = require('net');

module.exports = function(config) {
  var _auth;
  var _api;
  var _config;
  var logger;

  var login = function(out, username, password, cb) {
    if (typeof username === 'function') {
      cb = username;
      username = '';
      password = '';
    }

    _auth.login(username, password, function(err, result) {
      if (err) {
        if (err.errno === 34) { 
          out.response({ok: false, result: 'err', err: 'missing git config file: ' + err.path});
        }
        else {
          out.response({ok: false, result: 'err', err: err});
        }
        return cb(err);
      }
      if (result.user) {
        out.connection.user = result.user;
      }
      out.response(result);
      cb();
    });
  };



  var token = function(out, token, cb) {
    _auth.userInfo(token, function(err, user) {
      if (err) { return cb(err); }
      out.connection.user = user;
      out.response(user);
      cb();
    });
  };


  var authorized = function(connection, out) {
    if (!connection.user) {
      out.response({ok:false, err:'missing credentials, run nscale login first'});
    }
    return connection.user;
  };



  var githubLogin = function(out, accessToken, cb) {
    _auth.githubLogin(accessToken, function(err, result) {
      if (err) { return cb(err); }
      if (result.user) {
        out.connection.user = result.user;
      }
      out.response(result);
      cb();
    });
  };



  var listSystems = function(out, cb) {
    _api.listSystems(function(err, systems) {
      if (err) { return cb(err); }

      logger.info('rsp: list systems');
      out.response(systems);
      cb();
    });
  };



  var createSystem = function(out, name, namespace, cwd, cb) {
    _api.createSystem(out.connection.user, name, namespace, cwd, function(err, system) {
      if (err) {
        return cb(err);
      }
      logger.info('rsp: create system');
      out.response(system);
      cb();
    });
  };




  var getDeployed = function(out, systemId, target, cb) {
    _api.getDeployedSystem(systemId, target, function(err, system) {
      if (err) {
        return cb(err);
      }
      logger.info('rsp: get deployed ' + systemId + ' ' + target);
      out.response(system);
      cb();
    });
  };




  var linkSystem = function(out, path, cwd, cb) {
    _api.linkSystem(out.connection.user, path, cwd, function(err) {
      logger.info('rsp: link system');
      if (err) {
        return cb(err);
      }
      out.response({ result: 'ok' });
      cb();
    });
  };



  var unlinkSystem = function(out, systemId, cb) {
    _api.unlinkSystem(out.connection.user, systemId, function(err) {
      logger.info('rsp: unlink system');
      if (err) {
        return cb(err);
      }
      out.response({ result: 'ok' });
      cb();
    });
  };



  var listContainers = function(out, systemId, revisionId, cb) {
    _api.listContainers(systemId, revisionId, out, function(err, containers) {
      if (err) {
        return cb(err);
      }
      logger.info({ systemId: systemId, revisionId: revisionId }, 'rsp: list containers');
      out.response(containers);
      cb();
    });
  };



  var buildContainer = function(out, systemId, containerId, revisionId, target, cb) {
    _api.buildContainer(out.connection.user, systemId, containerId, revisionId, target, out, function(err, result) {
      logger.info({
        systemId: systemId,
        containerId: containerId,
        revisionId: revisionId
      }, 'rsp: build container');

      if (err) {
        out.response({ok: false, err: err});
        cb(err);
      }
      else {
        out.response(result);
        cb();
      }
    });
  };



  var buildAllContainers = function(out, systemId, revisionId, target, cb) {
    _api.buildAllContainers(out.connection.user, systemId, revisionId, target, out, function(err, result) {
      logger.info('rsp: build all containers ' + systemId);
      if (err) {
        out.response({ok: false, err: err});
        return cb(err);
      }
      out.response(result);
      cb();
    });
  };





  var fixSystem = function(out, systemId, target, cb) {
    var user = out.connection.user;
    _api.fixSystem(user, systemId, target, out, function(err, result) {
      logger.info('rsp: fix system ' + user + ' ' + systemId + ' ' + target);
      if (err) {
        return cb(err);
      }
      out.response({ok:true});
      cb();
    });
  };



  var compileSystem = function(out, systemId, cb) {
    var user = out.connection.user;
    _api.compileSystem(user, systemId, out, function(err, result) {
      logger.info('rsp: compile system ' + user + ' ' + systemId);
      if (err) {
        return cb(err);
      }
      out.response({ok:true});
      cb();
    });
  };



  var analyzeSystem = function(out, systemId, target, cb) {
    var user = out.connection.user;
    _api.analyzeSystem(user, systemId, target, out, function(err, result) {
      logger.info('rsp: analyze system ' + systemId + ' ' + target);
      if (err) {
        return cb(err);
      }
      out.response(result);
      cb();
    });
  };



  var checkSystem = function(out, systemId, target, cb) {
    var user = out.connection.user;
    _api.checkSystem(user, systemId, target, out, function(err, result) {
      logger.info('rsp: check system ' + user + ' ' + systemId + ' ' + target);
      if (err) {
        return cb(err);
      }
      out.response(result);
      cb();
    });
  };


  var markRevision = function(out, systemId, revisionId, cb) {
    var user = out.connection.user;
    _api.markRevision(user, systemId, revisionId, function(err, result) {
      logger.info('rsp: mark revision ' + user + ' ' + systemId + ' ' + revisionId);
      if (err) {
        return cb(err);
      }
      out.response(result);
      cb();
    });
  };



  var previewRevision = function(out, systemId, revisionId, target, cb) {
    var user = out.connection.user;
    _api.previewRevision(user, systemId, revisionId, target, out, function(err, result) {
      logger.info('rsp: preview system ' + user + ' ' + systemId + ' ' + revisionId + ' ' + target);
      if (err) {
        return cb(err);
      }
      out.response(result);
      cb();
    });
  };



  var deployRevision = function(out, systemId, revisionId, target, cb) {
    var user = out.connection.user;
    _api.deployRevision(user, systemId, revisionId, target, 'live', out, function(err, result) {
      logger.info('rsp: deploy system ' + user + ' ' + systemId + ' ' + revisionId + ' ' + target);
      if (err) {
        return cb(err);
      }
      out.response(result);
      cb();
    });
  };



  var listRevisions = function(out, systemId, cb) {
    _api.listRevisions(systemId, function(err, result) {
      logger.info('rsp: list revisions ' + systemId);
      if (err) {
        return cb(err);
      }
      out.response(result);
      cb();
    });
  };



  var getRevision = function(out, systemId, revisionId, target, cb) {
    _api.getRevision(systemId, revisionId, target, function(err, result) {
      logger.info({ systemId: systemId, revisionId: revisionId, target: target }, 'rsp: get revision');
      if (err) {
        return cb(err);
      }
      out.response(result);
      cb();
    });
  };



  var timeline = function(out, systemId, cb) {
    _api.timeline(systemId, function(err, result) {
      logger.info('rsp: timeline');
      if (err) {
        return cb(err);
      }
      out.response(result);
      cb();
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
      preview: previewRevision,
      deploy: deployRevision
    },

    system: {
      list: listSystems,
      create: createSystem,
      deployed: getDeployed,
      analyze: analyzeSystem,
      check: checkSystem,
      link: linkSystem,
      unlink: unlinkSystem,
      fix: fixSystem,
      compile: compileSystem
    },

    container: {
      list: listContainers,
      build: buildContainer,
      buildall: buildAllContainers
    },

    timeline: {
      list: timeline
    }
  };



  function forEachHandler(current, base, callback) {
    if (typeof current === 'function') {
      callback = current;
      current = handlers;
      base = '';
    }
    Object.keys(current).forEach(function(key) {
      var newBase = base + key + ' ';
      if (typeof current[key] === 'function') {
        callback(newBase.trim(), current[key]);
      }
      else {
        forEachHandler(current[key], newBase, callback);
      }
    });
  }


  var _server = new bcksrv();

  forEachHandler(function(command, func) {
    _server.register(command, function(args, stream, cb) {
      var req = command;
      logger.info('rcv: ' + req);
      var out = netOut(stream, req, logger);
      var authorizedUser = authorized(stream, out);

      args.unshift(out);
      args.push(cb);

      if (!authorizedUser) {
        logger.error('missing credentials, run nsd login first');
        cb();
      }
      else {
        try {
          func.apply(null, args);
        }
        catch(err) {
          err.out = out;
          stream.emit('error', err);
          cb();
        }
      }
    });
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
      var out = netOut(stream, req, logger);
      logger.info('rcv: ' + req);

      args.unshift(out);
      args.push(cb);
      try {
        handlersUnauthorized[cmd].apply(null, args);
      } catch(err) {
        err.out = out;
        stream.emit('error', err);
        cb();
      }
    });
  });




  return {
    stream: function(api, auth) {
      var stream = _server.stream();

      stream.on('commandError', function(cmd, args, err) {
        logger.info(err);
        args[0].stderr(err.message);
        setImmediate(function() {
          stream.end();
        });
      });

      stream.once('error', function(err) {
        logger.error(err);
        stream.on('error', function() {});

        try {
          if (err.out) {
            err.out.stderr(err.stack);
            stream.end();
          }
        } catch(err) {
          console.log(err);
          // swallow any other errors
        }
      });

      return stream;
    },

    set: function(api, auth, log) {
      if (_auth) {
        // do not reconfigure
        return;
      }

      _auth = auth;
      _api = api;
      logger = log;

      _config = config || {};
      _config.port = _config.port || 3223;

      return this;
    },

    start: function(api, auth, logger) {
      this.set(api, auth, logger);

      var that = this;

      var server = net.createServer(function(conn) {
        conn.pipe(that.stream()).pipe(conn);
      });

      server.listen(_config.port);
      return server;
    }
  };
};

