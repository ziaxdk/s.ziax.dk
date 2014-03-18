var util = require('util'),
    Writable = require('stream').Writable;

module.exports = function() {
  return new NullStream();
};

function NullStream() {
  Writable.call(this, {});
}

util.inherits(NullStream, Writable);
NullStream.prototype._write = function (chunk, encoding, done) {
  done();
};