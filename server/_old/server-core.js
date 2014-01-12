// module.exports = function (esClient, app) {
//   var Drive = require('./server-api-drive.js'),
//       // Q =  require('./server-api-q.js'),
//       exQ =  require('./server-api-exq.js'),
//       His =  require('./server-api-history.js'),
//       Suggest =  require('./server-api-suggest.js')

//       Utils = require('./utils')
//       ;

//   // Locals


//   var self = {}, INDEX = "ziax";

//   self.INDEX = "ziax";

//   self.ensureAuthenticated =  function (req, res, next) {
//     if (req.isAuthenticated()) { return next(); }
//     res.redirect('/loginerr');
//   };

//   self.ngSafe = function (val) {
//     return ")]}',\n" + JSON.stringify(Utils.ngPrivate(val)); // Angular 1.2.0
//     // return ")]}',\n" + JSON.stringify(val);
//   }

//   self.validateCode = function (code) {
//     var d = new Date();
//     var val = d.getDate() + '' + d.getDate();
//     return val === code;
//   }

//   self.escallback = function (req, res, next) {
//     return function (err, data) {
//       if (err) {
//         return next(err);
//       }
//       res.send(self.ngSafe(data));
//     };
//   };

//   Drive(esClient, app, self);
//   // Q(esClient, app, self);
//   exQ(esClient, app, self);
//   His(esClient, app, self);
//   Suggest(esClient, app, self);


//   // // Api
//   // app.get('/api/debug', function (req, res) {
//   //   res.send(ngSafe("debug"));
//   // });

//   app.get('/api/me', self.ensureAuthenticated, function (req, res) {
//     res.send(self.ngSafe(req.user));
//   });

//   app.post('/api/star', function (req, res) {
//     esClient.update({ _index: self.INDEX, _type: req.body.type, _id: req.body.id }, { doc: { "star" : req.body.val } }, function (err, data) {
//       console.log (err ? err : data);
//     });
//     res.send(self.ngSafe("ok"));
//   });



//   // var parent = function () { };
//   // parent.prototype.fun = function(first_argument) {
//   //   console.log('// body...');
//   // };

//   // var child = function () {};
//   // child.prototype = new parent();



//   // var i = new child();
//   // i.fun();

//   return self;
// };