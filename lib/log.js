'use strict';
const Raven = require('raven');
const logger = require('pino')({
  name: process.env.APP_NAME,
  prettyPrint: 'true'
});
const expressLogger = require('express-pino-logger')({
  logger: logger
});
logger.level = process.env.LOG_LEVEL || 'debug';

// redefine
logger.error = (function() {
  var cached_function = logger.error;
  return function() {
    var result = cached_function.apply(this, arguments); // use .apply() to call it
    // more of your code
    // Raven.captureException(JSON.stringify(arguments, null, 2));
    return result;
  };
})();

module.exports = {
  logger,
  expressLogger
};
