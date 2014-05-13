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
    api.getSystem(systemId, function(err, system) {
      logger.info('rsp: get system');
      out.response(system);
    });
  };



  var putSystem = function(out, systemJson) {
    api.putSystem(systemJson, function(err) {
      logger.info('rsp: put system');
      if (err) {
        out.response({result: 'err', err: err});
      }
      else {
        out.response({result: 'ok'});
      }
    });
  };



  var listContainers = function(out, systemId) {
    api.listContainers(systemId, function(err, containers) {
      logger.info('rsp: list containers ' + systemId);
      out.response(containers);
    });
  };



  var buildContainer = function(out, systemId, containerId) {
    api.buildContainer(systemId, containerId, out, function(err, result) {
      logger.info('rsp: build container' + systemId);
      out.response(result);
    });
  };



  var deployContainer = function(out, systemId, containerId) {
    api.deployContainer(systemId, containerId, out, function(err, result) {
      logger.info('rsp: deploy container' + systemId);
      out.response(result);
    });
  };



  var quitConnection = function(connection, out) {
    logger.info('rsp: quit');
    out.response({bye: 'bye!'}, function() {
      connection.end();
    });
  };



  var handlers = {list: { systems: listSystems,
                          containers: listContainers},
                  create: {system: createSystem},
                  get: {system: getSystem},
                  put: {system: putSystem},
                  build: { container: buildContainer},
                  deploy: { container: deployContainer},
                  quit: quitConnection };



  /**
   * construct the server
   */
  var construct = function() {
    _server = new cmdsrv();
    var mode = 'command';
    var put = '';
    var putTarget;

    _server.on('list', function(connection, target, id){
      logger.info('rcv: list ' + target);
      handlers.list[target](netOut(connection, 'list ' + target), id);
    });

    _server.on('create', function(connection, target, name, namespace){
      logger.info('rcv: create ' + target);
      handlers.create[target](netOut(connection, 'create ' + target), name, namespace);
    });

    _server.on('get', function(connection, target, id){
      logger.info('rcv: get' + target);
      handlers.get[target](netOut(connection, 'get ' + target), id);
    });

    _server.on('put', function(connection, target){
      mode = 'line';
      logger.info('rcv: put' + target);
      put = '';
      putTarget = target;
    });

    _server.on('build', function(connection, target, systemId, containerId){
      logger.info('rcv: build' + target);
      handlers.build[target](netOut(connection, 'build ' + target), systemId, containerId);
    });

    _server.on('deploy', function(connection, target, systemId, containerId){
      logger.info('rcv: deploy' + target);
      handlers.deploy[target](netOut(connection, 'deploy ' + target), systemId, containerId);
    });

    _server.on('quit', function(connection){
      logger.info('rcv: quit');
      handlers.quit(connection, netOut(connection, 'quit'));
    });

    _server.on('line', function(connection, line) {
      if (mode === 'line') {
        if (line.indexOf('END') !== -1) {
          mode = 'command';
          handlers.put[putTarget](netOut(connection, 'put ' + putTarget), put);
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

