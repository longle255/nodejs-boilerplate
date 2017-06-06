/**
 * jwtAuthenticated middleware
 */

var jwt = require('jsonwebtoken');

module.exports = function() {
  return function(req, res, next) {
    if (req.method === 'OPTIONS') {
      return next();
    }
    var authHeader = req.header('authorization');
    if (!authHeader) {
      return next();
    }

    function skipError(successCallback) {
      return function(err, data) {
        if (err) {
          return next();
        }
        successCallback(data);
      };
    }
    jwt.verify(authHeader.replace(/bearer\s/i, ''), process.env.SESSION_SECRET, skipError(function(payload) {
      db.User.findById(payload._id, skipError(function(user) {
        if (user) {
          req.user = user;
        }
        next();
        db.User.update({
          _id: payload._id
        }, {
          $set: {
            lastActivity: new Date()
          }
        }).exec();
      }));
    }));
  };
};
