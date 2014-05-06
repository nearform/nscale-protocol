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
    var systems = api.listSystems();
    logger.info('rsp: list systems');
    out.response(systems);
  };



  var listContainers = function(out, systemId) {
    var containers = api.listContainers(systemId);
    logger.info('rsp: list containers ' + systemId);
    out.response(containers);
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
                  build: { container: buildContainer},
                  deploy: { container: deployContainer},
                  quit: quitConnection };



  /**
   * construct the server
   */
  var construct = function() {
    _server = new cmdsrv();

    _server.on('list', function(connection, target, id){
      logger.info('rcv: list ' + target);
      handlers.list[target](netOut(connection, 'list ' + target), id);
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

    logger.info('starting protocol...');
    _server.start();
  };



  construct();
  return {
  };
};

