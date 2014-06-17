var Users = require('./Users.js'),
    Hash = require('./hash.js'),
    utils = require('./utils.js');


function route(app) {
  // app.get('/v4', function(req, res) {
  //   res.send('ok');
  // });

  app.use(function(req, res, next) {
    // return next();
    function send403() {
      res.status(403);
      res.send();
    }
    var uid = req.query['uid'],
        hid = req.query['hid'];

    // console.log('h2', hid);

    if (!uid || !hid) {
      send403();
      return;
    }


    var user = Users.getById(uid);
    if (!user) {
      send403();
      return;
    }

    if (Hash(user.id, user.salt) === hid) {
      req.user = user;
      return next();
    }
    send403();
  });



  app.route('/v4')
    .get(function(req, res) {
      res.send({ isAuth: req.isAuthenticated(), hid: Hash('1001', '4b88cb1e45d71528') });
      // res.send(req.isAuthenticated());
    })
    .post(function(req, res) {
      res.send({ foo: 'bar' });
      // res.send(req.isAuthenticated());
    });


    // curl "localhost:8081/v4?uid=1001&hid=961db138b793d6250240ac4ceb084737"
    // curl "localhost:8081/v4?uid=1001&hid=961db138b793d6250240ac4ceb"
}

module.exports = {
  route: route
};
