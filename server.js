'use strict';

require('dotenv').config({ silent: true });
// const Raven = require('raven');
// Raven.config(process.env.RAVEN_URL).install();

var app = require('./app');
app.start();
