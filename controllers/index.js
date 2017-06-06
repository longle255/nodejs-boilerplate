'use strict';

module.exports = function(router) {
  router.get('/', function(req, res) {
    res.send('<code><pre>' + JSON.stringify({ OK: true }, null, 2) + '</pre></code>');
  });
};
