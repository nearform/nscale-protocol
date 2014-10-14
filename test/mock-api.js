
'use strict';

var util = require('util');
var EE = require('events').EventEmitter;

function MockApi() {
  if (!(this instanceof MockApi)) {
    return new MockApi();
  }

  this.nextError = null;
}

util.inherits(MockApi, EE);

MockApi.prototype.listSystems = function(cb) {
  var systems = [];
  cb(this.nextError, systems);
};

MockApi.prototype.createSystem = function(user, name, namespace, cwd, callback) {
  var system = {};
  callback(this.nextError, system);
};

MockApi.prototype.getHeadSystem = function(systemId, callback) {
  var system = {};
  callback(this.nextError, system);
};

MockApi.prototype.getDeployedSystem = function(systemId, callback) {
  var system = {};
  callback(this.nextError, system);
};

MockApi.prototype.putSystem = function(user, systemJson, callback) {
  callback(this.nextError);
};

MockApi.prototype.cloneSystem = function(user, url, cwd, callback) {
  callback(this.nextError);
};

MockApi.prototype.linkSystem = function(user, path, cwd, callback) {
  callback(this.nextError);
};

MockApi.prototype.syncSystem = function(user, systemId, callback) {
  callback(this.nextError);
};

MockApi.prototype.addRemote = function(user, systemId, url, callback) {
  callback(this.nextError);
};

MockApi.prototype.listContainers = function(systemId, callback) {
  callback(this.nextError, {});
};

MockApi.prototype.buildContainer = function(user, systemId, containerId, out, callback) {
  var result = {};
  callback(this.nextError, result);
};

MockApi.prototype.deployRevision = function(user, systemId, revisionId, live, out, callback) {
  var result = {};
  callback(this.nextError, result);
};

MockApi.prototype.analyzeSystem = function(user, systemId, out, callback) {
  var result = {};
  callback(this.nextError, result);
};

MockApi.prototype.checkSystem = function(user, systemId, out, callback) {
  var result = {};
  callback(this.nextError, result);
};

MockApi.prototype.markRevision = function(user, systemId, revisionId, callback) {
  var result = { result: 'ok' };
  callback(this.nextError, result);
};

MockApi.prototype.previewRevision = function(user, systemId, revisionId, out, callback) {
  var result = {};
  callback(this.nextError, result);
};

MockApi.prototype.listRevisions = function(systemId, callback) {
  var result = {};
  callback(this.nextError, result);
};

MockApi.prototype.getRevision = function(systemId, revisionId, callback) {
  var result = {};
  callback(this.nextError, result);
};

MockApi.prototype.timeline = function(systemId, callback) {
  var result = {};
  callback(this.nextError, result);
};

module.exports = MockApi;
