'use strict';
const errorMessages = nconf.get('errorMessages');
const UsersController = {
  async findAll(req, res) {
    try {
      let users = await db.User.find();
      return res.json({
        status: 200,
        data: users
      });
    } catch (err) {
      log.error(err);
      return Services.Util.controllerCallback(res)(errorMessages.serverError);
    }
  }
};

module.exports = function(router) {
  router.get('/', authorizeRequest.call(null, 'user'), UsersController.findAll);
};
