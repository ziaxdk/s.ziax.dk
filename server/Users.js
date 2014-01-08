(function () {
  var _ = require('underscore');

  module.exports = function () {
    var _users = [
        { id: '1001', email: 'kenneth@ziax.dk', name: 'Kenneth Olsen' }
      ];

    function getByEmail(email) {
      return _.find(_users, function (user) { return email === user.email; });
    }

    function getById(id) {
      return _.find(_users, function (user) { return id === user.id; });
    }

    function existsByEmail(email) {
      return !!getByEmail(email);
    }


    return {
      existsByEmail: existsByEmail,
      getByEmail: getByEmail,
      getById: getById,
      users: _users
    };
  };
}());