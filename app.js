'use strict';

const express = require('express');
const kraken = require('kraken-js');
const _ = require('lodash');
const nconf = require('nconf');
const path = require('path');
const Log = require('./lib/log');

var server = (module.exports = {});

server.start = function(callback) {
  let options;
  // Setup global utils
  global.log = Log.logger;
  global._ = _;
  global.nconf = nconf;

  nconf.argv().env()
  .file('mainConfig', path.resolve(process.cwd(), './config/' + process.env.NODE_ENV + '.json'))
  .file('messages', path.resolve(process.cwd(), './config/messages.json'));

  const Services = require('./services');
  global.Services = Services;

  options = {
    onconfig: async (config, next) => {
      try {
        await require('./lib/mongoose')(app, config);
        await require('./lib/agenda')(app, config);
        await require('./lib/PassportJwt')(app, config);
        next(null, config);
      } catch (err) {
        log.error(err);
      }
    }
  };

  let app = express();
  app.use(kraken(options));
  app.use(Log.expressLogger);

  callback =
    callback ||
    function() {
      log.info('Application ready to serve requests.');
      log.info('Environment: %s', app.kraken.get('env:env'));
      log.info('Server listening on http://localhost:%d', nconf.get('PORT'));
    };

  app.on('start', callback);

  var PORT = nconf.get('PORT');
  return app.listen(PORT);
};
