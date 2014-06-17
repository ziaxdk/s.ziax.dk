var crypto = require('crypto'),
    Hash = require('./server/hash.js'),
    args = process.argv,
    obj = {};

if (args.length !==3) {
  console.log('Provide id');
  return;
}
var id = args[2];

crypto.pseudoRandomBytes(8, function(err, res) {
  // console.log(res.toString('hex'));
  obj.salt = res.toString('hex');
  obj.hid = Hash(id, obj.salt);
  // console.log(obj);
  console.log(obj);
});

