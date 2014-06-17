var _ = require('lodash'),
    _users = require('../_config.json').users;

function getByEmail(email) {
  return _.find(_users, function (user) { return email === user.email; });
}

function getById(id) {
  if (!id) return;
  return _.find(_users, function (user) { return id.toString() === user.id; });
}

function existsByEmail(email) {
  return !!getByEmail(email);
}

module.exports = {
  existsByEmail: existsByEmail,
  getByEmail: getByEmail,
  getById: getById,
  users: _users
};
