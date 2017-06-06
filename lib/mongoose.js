const mongoose = require('mongoose');
const db = require('../models');
mongoose.Promise = global.Promise;

module.exports = async function() {
  // create the database connection
  // mongoose.set('debug', process.env.MONGOOSE_DEBUG);

  // when the connection is connected
  mongoose.connection.on('connected', () => {
    log.info(`mongoose connection open to ${process.env.MONGO_URI}`);
  });

  // if the connection throws an error
  mongoose.connection.on('error', log.error);

  // when the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    log.info('mongoose disconnected');
  });

  // connect to mongodb
  await reconnect();

  return mongoose;
};

const MONGOOSE_RECONNECT_MS = 1000;
function reconnect() {
  return new Promise(async (resolve) => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      global.db = db;
      resolve();
    } catch (err) {
      log.error(err);
      log.info(`attempting to reconnect in (${MONGOOSE_RECONNECT_MS}) ms`);
      setTimeout(() => {
        resolve(reconnect());
      }, MONGOOSE_RECONNECT_MS);
    }
  });
}
