'use strict';

const express = require('express');
const kraken = require('kraken-js');
const _ = require('lodash');
const nconf = require('nconf');
const path = require('path');
const Log = require('./lib/log');
const Services = require('./services');

let options, app;
// Setup global utils
global.log = Log.logger;
global._ = _;
global.Services = Services;
global.nconf = nconf;

nconf.argv().env()
  .file('messages', path.resolve(process.cwd(), './config/messages.json'));

options = {
  onconfig: async (config, next) => {
    try {
      await require('./lib/mongoose')(app, config);
      await require('./lib/PassportJwt')(app, config);
      next(null, config);
    } catch (err) {
      log.error(err);
    }
  }
};

app = module.exports = express();
app.use(kraken(options));
app.use(Log.expressLogger);
app.on('start', () => {
  log.info('Application ready to serve requests.');
  log.info('Environment: %s', app.kraken.get('env:env'));
});
