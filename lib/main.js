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
var logger = require('winston');



module.exports = function(api) {
  var _server;


  var listSystems = function(out) {
    api.listSystems(function(err, systems) {
      logger.info('rsp: list systems');
      out.response(systems);
    });
  };



  var createSystem = function(out, name, namespace) {
    api.createSystem(name, namespace, function(err, system) {
      logger.info('rsp: create system');
      out.response(system);
    });
  };



  var getSystem = function(out, systemId) {
    api.getHeadSystem(systemId, function(err, system) {
      logger.info('rsp: get system ' + systemId);
      out.response(system);
    });
  };



  var getDeployed = function(out, systemId) {
    api.getDeployedSystem(systemId, function(err, system) {
      logger.info('rsp: get deployed ' + systemId);
      out.response(system);
    });
  };



  var putSystem = function(out, systemJson, user) {
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



  var deleteSystem = function(out, systemId) {
    api.deleteSystem(systemId, function(err) {
      logger.info('rsp: delete system');
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };



  var listContainers = function(out, systemId) {
    api.listContainers(systemId, function(err, containers) {
      logger.info('rsp: list containers ' + systemId);
      out.response(containers);
    });
  };



  var addContainer = function(out, containerJson, systemId) {
    api.addContainer(systemId, containerJson, function(err) {
      logger.info('rsp: add container');
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };



  var putContainer = function(out, containerJson, user, systemId) {
    api.putContainer(user, systemId, containerJson, function(err) {
      logger.info('rsp: put container');
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };



  var deleteContainer = function(out, systemId, containerId) {
    api.deleteContainer(systemId, containerId, function(err) {
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



  var deploySystem = function(out, systemId, revisionId) {
    api.deploySystem(systemId, revisionId, out, function(err, result) {
      logger.info('rsp: deploy system ' + systemId + ' ' + revisionId);
      out.response(result);
    });
  };



  var deployAll = function(out, systemId, revisionId) {
    api.deployAll(systemId, revisionId, out, function(err) {
      logger.info('rsp: deploy all' + systemId + ' ' + revisionId);
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };


  var listRevisions = function(out, systemId) {
    api.listRevisions(systemId, function(err, result) {
      logger.info('rsp: list revisions ' + systemId);
      out.response(result);
    });
  };



  var getRevision = function(out, systemId, revisionId) {
    api.getRevision(systemId, revisionId, function(err, result) {
      logger.info('rsp: get revision ' + systemId);
      out.response(result);
    });
  };



  var timeline = function(out, systemId, containerId, user) {
    api.timeline(systemId, containerId, user, function(err, result) {
      logger.info('rsp: timeline');
      out.response(result);
    });
  };

  var addToTimeline = function(out, timelineJson) {
    api.addToTimeline(timelineJson, function(err) {
      logger.info('rsp: add to timeline');
      if (err) { out.response({result: 'err', err: err}); }
      else { out.response({result: 'ok'}); }
    });
  };

  var quitConnection = function(connection, out) {
    logger.info('rsp: quit');
    out.response({bye: 'bye!'}, function() {
      connection.end();
    });
  };



  var handlers = {list: { systems: listSystems,
                          containers: listContainers,
                          revisions: listRevisions,
                          timeline: timeline},
                  create: {system: createSystem},
                  get: {system: getSystem, revision: getRevision, deployed: getDeployed},
                  add: {container: addContainer, timeline: addToTimeline},
                  put: {system: putSystem, container: putContainer},
                  delete: {system: deleteSystem, container: deleteContainer},
                  build: { container: buildContainer},
                  deploy: { system: deploySystem, all: deployAll},
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

    _server.on('list', function(connection, target, systemId, containerId, user){
      logger.info('rcv: list ' + target);
      handlers.list[target](netOut(connection, 'list ' + target), systemId, containerId, user);
    });

    _server.on('create', function(connection, target, name, namespace){
      logger.info('rcv: create ' + target);
      handlers.create[target](netOut(connection, 'create ' + target), name, namespace);
    });

    _server.on('get', function(connection, target, systemId, otherId){
      logger.info('rcv: get ' + target);
      handlers.get[target](netOut(connection, 'get ' + target), systemId, otherId);
    });

    _server.on('delete', function(connection, target, systemId, containerId){
      logger.info('rcv: delete ' + target);
      handlers.delete[target](netOut(connection, 'delete ' + target), systemId, containerId);
    });

    _server.on('add', function(connection, target, id) {
      mode = 'lineAdd';
      logger.info('rcv: add ' + target);
      put = '';
      lineTarget = target;
      lineId = id;
    });

    _server.on('put', function(connection, target, user, id){
      mode = 'linePut';
      logger.info('rcv: put ' + target);
      put = '';
      lineTarget = target;
      lineUser = user;
      lineId = id;
    });

    _server.on('build', function(connection, target, user, systemId, containerId){
      logger.info('rcv: build ' + target);
      handlers.build[target](netOut(connection, 'build ' + target), user, systemId, containerId);
    });

    _server.on('deploy', function(connection, target, systemId, revisionId){
      logger.info('rcv: deploy' + target);
      handlers.deploy[target](netOut(connection, 'deploy ' + target), systemId, revisionId);
    });

    _server.on('quit', function(connection){
      logger.info('rcv: quit');
      handlers.quit(connection, netOut(connection, 'quit'));
    });

    _server.on('line', function(connection, line) {
      console.log('LINE: ' + line);
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
          handlers.add[lineTarget](netOut(connection, 'add ' + lineTarget), put, lineId);
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

