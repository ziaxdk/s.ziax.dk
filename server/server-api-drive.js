// module.exports = function (esClient, app, core) {
//   var _ = require('underscore');
//   // Drive
//   // app.get('/api/drive', function (req, res) {
//   //   // TODO: If user is authenticated, include onlyAuth also
//   //   esClient.search({_index: core.INDEX}, {
//   //     query : {
//   //       match_all: {}
//   //     }
//   //   }, core.escallback(req, res));
//   // });
//   app.get('/api/drive', function (req, res) {
//     esClient.count({ _index: 'ziax', _type: 'article,link,place' }, undefined, core.escallback(req,res));
//   });

//   // app.post('/api/drive', core.ensureAuthenticated, function (req, res) {
//   //   req.body.clicks = 0;
//   //   esClient.index({ _index: core.INDEX, _type: "drive"}, req.body, core.escallback(req, res));
//   // });

//   app.post('/api/drive', function (req, res) {
//     var save,
//         src = req.body,
//         ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//     if (!core.validateCode(src.code)) {
//       res.send("err");
//       return;
//     }
//     save = {
//       header: src.header,
//       content: src.content,
//       tags: src.tags,
//       createdutc: new Date(),
//       clicks: 0,
//       ip: ip,
//       onlyAuth: src.onlyAuth

//     };
//     switch(src.type) {
//       case 'link': {
//         save.url = src.url;
//         break;
//       }
//       case 'place': {
//         if (_.isObject(src.location)) {
//           save.location = src.location;
//         }
//         else {
//           var latlon = src.location.split(',');
//           save.location = { lat: latlon[0].trim(), lon: latlon[1].trim() };
//         }
//       }
//     }

//     // console.log(save);
//     // res.send("ok");
//     esClient.index({ _index: core.INDEX, _type: src.type }, save, core.escallback(req, res));
//   });
// };