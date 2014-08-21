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

'use strict';


module.exports = function(connection, request, logger) {
  var tickSize;
  var current;
  var _preview = [];
  var _plan;

  return {
    initProgress: function(steps) {
      tickSize = 100 / steps;
      current = 0;
      var result = {request: request,
                    responseType: 'stdout',
                    stdout: 0,
                    level: 'progress'};
      connection.write(JSON.stringify(result) + '\n');
    },

    connection: connection,

    plan: function(plan) {
      _plan = plan;
    },

    getPlan: function() {
      return _plan;
    },

    preview: function(op) {
      _preview.push(op);
    },

    operations: function() {
      return _preview;
    },


    progress: function() {
      current += tickSize;
      var result = {request: request,
                    responseType: 'stdout',
                    stdout: current,

                    level: 'progress'};
      connection.write(JSON.stringify(result) + '\n');
    },

    response: function(json, cb) {
      var result = {request: request,
                    responseType: 'response',
                    response: json};
      connection.write(JSON.stringify(result) + '\n');
      if (cb) { cb(); }
    },
    
    stdout: function(str, level) {
      var result = {request: request,
                    responseType: 'stdout',
                    stdout: str,
                    level: level || 'debug'};
      connection.write(JSON.stringify(result) + '\n');
      logger.info('stdout: ' + str);
    },

    stderr: function(str, level) {
      var result = {request: request,
                    responseType: 'stderr',
                    stderr: str,
                    level: level || 'error'};
      connection.write(JSON.stringify(result) + '\n');
      logger.info('stderr: ' + str);
    }
  };
};

