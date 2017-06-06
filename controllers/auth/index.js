'use strict';
const jwt = require('jsonwebtoken');
const passport = require('passport');
const errorMessages = nconf.get('errorMessages');
module.exports = function(router) {

  function isEmail(text) {
    return _.includes(text, '@');
  }

  function isValidUsername(username) {
    return /^[^@\s]+$/.test(username);
  }

  router.post('/', async function(req, res) {
    try {
      if (!req.body.password) {
        return Services.Util.controllerCallback(res)(errorMessages.loginFailed);
      }

      let query = {};
      if (req.body.username) {
        query.username = req.body.username;
      } else if (req.body.email) {
        query.email = req.body.email;
      } else if (req.body.user) {
        let type = isEmail(req.body.user) ? 'email' : 'username';
        query[type] = req.body.user;
      } else {
        return Services.Util.controllerCallback(res)(errorMessages.loginFailed);
      }
      let user = await db.User.findOne(query);
      if (!user) return Services.Util.controllerCallback(res)(errorMessages.loginFailed);
      let passwordMatched = await user.comparePassword(req.body.password);
      if (passwordMatched) {
        // Create token if the password matched and no error was thrown
        let userResult = user.toObject();
        userResult.password = undefined;
        let token = jwt.sign(userResult, process.env.SESSION_SECRET, {
          expiresIn: '14d' // 2 weeks
        });
        //update user status
        user.status = 'active';
        user.lastActivity = new Date();
        await user.save();
        return res.status(200).json({
          status: 200,
          token: 'Bearer ' + token
        });
      } else {
        return Services.Util.controllerCallback(res)(errorMessages.loginFailed);
      }
    } catch (err) {
      log.error(err);
      return Services.Util.controllerCallback(res)(err || errorMessages.loginFailed);
    }
  });

  router.post('/register', async(req, res) => {
    try {
      if (!req.body.email || !req.body.username || !req.body.password) {
        return Services.Util.controllerCallback(res)(errorMessages.missingUserInfo);
      }

      if (!isValidUsername(req.body.username)) {
        return Services.Util.controllerCallback(res)(errorMessages.invalidUsername);
      }

      if (req.body.password.length < db.User.PASSWORD_MINIMUM_LENGHT) {
        return Services.Util.controllerCallback(res)(errorMessages.invalidPasswordLength);
      }
      let user = await db.User.create(req.body);
      var result = user.toObject();
      delete result.password;
      res.json({
        status: 200,
        data: result
      });
    } catch (err) {
      log.error(err);
      if (err.code === 11000) {
        return res.status(400).json(errorMessages.emailUserNameDuplicated);
      }
      return res.status(400).json({
        status: 400,
        messages: [err]
      });
    }
  });

  router.post('/logout', async(req, res) => {
    await passport.authenticate('jwt', {
      session: false
    });
    return res.status(200).json({
      status: 200,
      data: {}
    });
  });
};
