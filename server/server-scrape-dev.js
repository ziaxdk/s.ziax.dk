// (function () {
//   var Utils = require('./utils');

//   var scrape = function (req, res) {
//     // console.log(req.query.q);

//     var obj = {
//       title1: null,
//       title2: "just a dummy title that came from a silly hardcoded scraper",

//       desc1: "some silly content that should be coming from a mega monster silly scraper",
//       desc2: "some silly content that should be coming from a mega monster silly scraper"
//     }

//     res.send(Utils.ngSafe(obj));

//   };


//   var obj = {
//     scrape: scrape
//   };

//   if (typeof module !== 'undefined' && module.exports) {
//     module.exports = obj;
//   }
//   else {
//     root.utils = obj;
//   }
// }());
