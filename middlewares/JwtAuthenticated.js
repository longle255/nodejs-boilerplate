/**
 * jwtAuthenticated middleware
 */

module.exports = function() {
  return function(req, res, next) {
    if (req.method === 'OPTIONS') {
      return next();
    }
    return jwtAuthenticated(req, res, next);
  };
};
