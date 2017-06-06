const Agenda = require('agenda');
const promisify = require('es6-promisify'); // keep this here until node support bind context to promisify
const memwatch = require('memwatch-next');
const Agendash = require('agendash');
const mongoose = require('mongoose');
const jobs = require('../jobs');

// when the connection is connected we need to override
// the default connection event, because agenda requires
// us to in order to connect with the same mongoose connection
mongoose.connection.on('connected', () => {
  // re-use existing mongoose connection
  // <https://github.com/rschmukler/agenda/issues/156#issuecomment-163700272>
  agenda.mongo(
    mongoose.connection.collection(process.env.AGENDA_COLLECTION_NAME).conn.db,
    process.env.AGENDA_COLLECTION_NAME,
    err => {
      if (err) return log.error(err);
      log.info('agenda opened connection using existing mongoose connection');
    }
  );
});

// similarly when disconnected, we need to ensure that we stop agenda
mongoose.connection.on('disconnected', async() => {
  if (agenda._collection) {
    cancel();
    try {
      await promisify(agenda.stop, agenda)();
    } catch (err) {
      log.error(err);
    }
  }
});

// set up agenda

const cancelOptions = {
  repeatInterval: {
    $exists: true,
    $ne: null
  }
};

const agenda = new Agenda({
  name: process.env.AGENDA_COLLECTION_NAME,
  maxConcurrency: process.env.AGENDA_MAX_CONCURRENCY
});

agenda.mongo(
  mongoose.connection.collection(process.env.AGENDA_COLLECTION_NAME).conn.db,
  process.env.AGENDA_COLLECTION_NAME,
  err => {
    if (err) return log.error(err);
    log.info('agenda opened connection using existing mongoose connection');
  }
);

agenda.on('ready', () => {
  log.info('agenda ready');

  cancel();

  // define all of our jobs
  _.each(jobs.getJobs(), function(_job) {
    agenda.define(..._job);
  });

  // i18n translation
  // agenda.now('locales');

  // if we're in dev mode, translate every minute
  // TODO: convert this to watch script somehow
  // if (config.env === 'development')
  //   agenda.every('5 minutes', 'locales');

  // TODO: we may need to change the `lockLifetime` (default is 10 min)
  // <https://github.com/rschmukler/agenda#multiple-job-processors>

  // TODO: recurring jobs
  // agenda.every('day', 'do something');

  agenda.start();
});

// handle events emitted
agenda.on('start', job => log.info(`job "${job.attrs.name}" started`));
agenda.on('complete', job => {
  log.info(`job "${job.attrs.name}" completed`);
  // manually handle garbage collection
  // <https://github.com/rschmukler/agenda/issues/129#issuecomment-108057837>
  memwatch.gc();
});
agenda.on('success', job => log.info(`job "${job.attrs.name}" succeeded`));
agenda.on('fail', (err, job) => {
  err.message = `job "${job.attrs.name}" failed: ${err.message}`;
  log.error(err, {
    extra: {
      job
    }
  });
});
agenda.on('error', log.error);

// cancel recurring jobs so they get redefined on the next server start
// <http://goo.gl/nu1Rco>
async function cancel() {
  if (!agenda._collection) return log.error('Collection did not exist');
  try {
    const cancelFn = promisify(agenda.cancel, agenda);
    await cancelFn(cancelOptions);
  } catch (err) {
    log.error(err);
  }
}

// handle uncaught promises
process.on('unhandledRejection', function(reason, p) {
  log.error(`unhandled promise rejection: ${reason}`, p);
  log.error(p, {
    depth: null
  });
});

// handle uncaught exceptions
process.on('uncaughtException', err => {
  log.error(err);
  process.exit(1);
});

// handle graceful restarts
process.on('SIGTERM', graceful);
process.on('SIGHUP', graceful);
process.on('SIGINT', graceful);

function graceful() {
  // stop accepting new jobs
  agenda.maxConcurrency(0);

  try {
    cancel();

    // give it only 5 seconds to gracefully shut down
    setTimeout(() => {
      throw new Error('agenda did not shut down after 5s');
    }, 5000);

    // check every second for jobs still running
    let jobInterval = setInterval(async() => {
      if (agenda._runningJobs.length > 0) {
        log.info(`${agenda._runningJobs.length} jobs still running`);
      } else {
        clearInterval(jobInterval);
        jobInterval = null;
        if (agenda._collection) await promisify(agenda.stop, agenda)();
      }
    }, 500);

    setInterval(() => {
      if (!jobInterval) {
        log.info('gracefully shut down');
        process.exit(0);
      }
    }, 500);
  } catch (err) {
    log.error(err);
    throw err;
  }
}

module.exports = function(app) {
  global.job = agenda;
  return new Promise(resolve => {
    app.use('/manage/agendash', Agendash(agenda));
    resolve(agenda);
  });
};
