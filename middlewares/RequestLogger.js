/**
 * RequestLogger middleware
 */

module.exports = function() {
  return function(req, res, next) {
    var method = req.method;
    var ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ips[req.ips.length - 1] || req.ip || '';
    var path = req.path;
    var body = req.body;
    var query = req.query;

    res.on('finish', function() {
      db.RequestLog.create({
        user: req.user ? req.user._id : null,
        path: path,
        method: method,
        ip: ip,
        reqBody: body,
        reqHeader: req.headers,
        reqQuery: query,
        resCode: res.statusCode,
        resBody: res.statusMessage
      }, function(err) {
        if (err) log.error(err);
      });

      if (req.user) {
        db.User.update({ _id: req.user._id }, {$set: { lastActivity: new Date() }}, function(err) {
          if (err) log.error(err);
        });
      }
    });

    return next();

  };
};
