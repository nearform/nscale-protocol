
'use strict';

var util = require('util');
var EE = require('events').EventEmitter;

function MockAuth() {
  if (!(this instanceof MockAuth)) {
    return new MockAuth();
  }
}

util.inherits(MockAuth, EE);

MockAuth.prototype.login = function(username, password, callback) {
  callback(err, result);
};

MockAuth.prototype.userInfo = function(token, callback) {
  var result = {
    user: {
      name: 'mocked user'
    }
  }
  callback(null, result);
};

module.exports = MockAuth;
