var crypto = require('crypto');

module.exports = function hash(pwd, salt) {
  return crypto.pbkdf2Sync(pwd.toString(), salt.toString(), 1024, 32).toString('hex');
  // hid":"a0d437804d9eee588e395febee872740a667585f368f43cddbebb6ec86798f40" - 1024 -32
};
