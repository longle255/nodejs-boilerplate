'use strict';

module.exports = function(router) {
  router.get('/', function(req, res) {
    res.send('<code><pre>' + JSON.stringify({
      OK: true
    }, null, 2) + '</pre></code>');
  });

  router.get('/test', function(req, res) {
    job.now('email', {
      template: 'default',
      from: 'longle@siliconprime.com',
      to: 'hoanglong25588@gmail.com',
      subject: 'Test',
      locals: {
        test: 'test'
      }
    });
    return res.send('<code><pre>' + JSON.stringify({
      OK: true
    }, null, 2) + '</pre></code>');
  });
};
