var SIO = require('./../server.js').sio,
    esDocument = require('./es-document.js');

SIO.sockets.on('connection', function (socket) {
  // console.log('A socket connected!');
  esDocument.count().then(function(data) {
    // count = data.count;
    socket.emit('connect', data);
  });
});

function status() {
  console.log(SIO);
}

function plusOne() {

}

module.exports = {
  plusOne: plusOne,
  status: status
};
