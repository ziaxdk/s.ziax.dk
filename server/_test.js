var m = require('./server-utils')();

var o = {
  '_test1_1': 'no1',
  'test1_2': 'no1',

  '_test2_1': ['no1'],
  'test2_2': ['no1'],

  '_test3_1': [{ 'key': 'key', 'value': 'value' }],
  'test3_2': [{ 'key': 'key', 'value': 'value' }],

  '_test4_1': [{ '_key': 'key', 'value': 'value' }],
  'test4_2': [{ 'key': 'key', '_value': 'value' }]
};

console.log(m.ngPrivateRemover(o));

// (function () {

//   var check = function (val) {
//     if (!val || val === null) return false;
//     return toString.apply(val) == '[object Array]' || typeof val == 'object' ;
//   };

//   function ngPrivate (obj) {
//     for (var key in obj) {
//       var val = obj[key];
//       if (obj.hasOwnProperty(key)) {
//         if (check(val)) ngPrivate(val);
//       }
//       if (key.indexOf('_', 0) === 0) {
//         var newkey = key.substring(1);
//         if (obj[newkey]) {
//           throw Error(newkey + ' exists');
//         }
//         obj[newkey] = val;
//         delete obj[key];
//       }
//     }
//     return obj;
//   }

//   function ngSafe (val) {
//     return ")]}',\n" + JSON.stringify(ngPrivate(val)); // Angular 1.2.0
//     // return ")]}',\n" + JSON.stringify(val);
//   }


//   var obj = {
//     ngSafe: ngSafe,
//     ngPrivate: ngPrivate
//   };


//   if (typeof module !== 'undefined' && module.exports) {
//     module.exports = obj;
//   }
//   else {
//     root.utils = obj;
//   }
// }());
