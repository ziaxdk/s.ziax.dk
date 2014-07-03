var gutil = require('gulp-util'),
    fork  = require( 'child_process' ).fork,
    async = require('async'),
    server = null;


function Server(options) {
  this.options = options;
  this.app = null;
}

Server.prototype.start = function() {

  this.app = fork( this.options.script, { silent: true, env: { NODE_ENV: 'development', port: this.options.port } } );
  this.app.stdout.pipe( process.stdout );
  this.app.stderr.pipe( process.stderr );

  gutil.log( gutil.colors.cyan( 'Started' ), 'express server ( PID:', this.app.pid, ')' );

};

Server.prototype.stop = function() {
  // gutil.log( gutil.colors.cyan( 'Stopping' ), 'express server' );
  if( this.app.connected ) {
    var t = this;
    this.app.on( 'exit', function() {
      gutil.log( gutil.colors.red( 'Stopped' ), 'express server ( PID:', t.app.pid, ')' );
    });
    server = null;
    return this.app.kill( 'SIGINT' );
  }
};

var serve = function(options) {
  if (server) {
    server.stop();
  }
  server = new Server(options);
  server.start();
};


module.exports = {
  serve: serve
};
