const Util = {
  rand(min, max) {
    return Math.floor(Math.random() * max) + min;
  },

  controllerCallback(res, processResult) {
    function processError(err) {
      if (err.name === 'ValidationError') {
        err.status = 400;
      } else if (err.name === 'MongoError' && (err.code === 11000 || err.code === 11001)) {
        var duplicatedValue = /{ : "(.*)" }$/.exec(err.message);
        if (duplicatedValue) {
          err = {
            status: 400,
            message: duplicatedValue[1] + ' is already in used',
            error: err
          };
        }
      }
      return err;
    }

    return function(err, result) {
      if (err) {
        err = processError(err);
        var status = err.status || 500;
        return res.status(status).send({
          status: status,
          message: err.message || err,
          code: err.code || 'SERVER_ERROR'
        });
      }
      if (typeof processResult === 'function') {
        var args = Array.prototype.slice.call(arguments, 1);
        result = processResult.apply(null, args);
      }
      res.send({
        status: 200,
        data: result
      });
    };
  }
};

module.exports = Util;
