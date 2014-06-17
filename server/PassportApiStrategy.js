var passport = require('passport'),
    util = require('util'),
    Users = require('./Users.js'),
    Hash = require('./hash.js');

function Strategy() {

  passport.Strategy.call(this);
  this.name = 'auth-api-strategy';
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req, options) {
  var uid = req.query['uid'],
      hid = req.query['hid'],
      user = Users.getById(uid);

  if (!uid || !hid || !user || Hash(user.id, user.salt) !== hid) {
    return this.pass();
  }
  return this.success(user);
};

module.exports = Strategy;
