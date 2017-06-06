'use strict';

require('dotenv').config({ silent: true });
const Raven = require('raven');
Raven.config(process.env.RAVEN_URL).install();

var app = require('./index');
var http = require('http');


var server;

/*
 * Create and start HTTP server.
 */

server = http.createServer(app);
server.listen(process.env.PORT || 8000);
server.on('listening', function () {
    log.info('Server listening on http://localhost:%d', this.address().port);
});
