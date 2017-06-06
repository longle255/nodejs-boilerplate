const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const errorMessages = nconf.get('errorMessages');
const passport = require('passport');
const ROLES = {
  user: 1,
  'client-admin': 2,
  'super-admin': 3
};

module.exports = function(app) {
  return new Promise((resolve) => {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = process.env.SESSION_SECRET;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
      db.User.findOne({
        _id: jwt_payload._id,
        status: {
          $in: ['active']
        }
      }, (err, user) => {
        done(err, user);
        // update user.lastActivity, doesn't care result
        db.User.update({
          _id: user._id
        }, {
          $set: {
            lastActivity: new Date()
          }
        }).exec();
      });
    }));

    app.use(passport.initialize());

    global.jwtAuthenticated = passport.authenticate('jwt', {
      session: false
    });

    global.authorizeRequest = function(minimumRole) {
      return function(req, res, next) {
        if (!req.user)
          return Services.Util.controllerCallback(res)(errorMessages.unauthorized);
        if (ROLES[req.user.role] < ROLES[minimumRole])
          return Services.Util.controllerCallback(res)(errorMessages.forbidden);
        return next();
      };
    };

    resolve();
  });
};
