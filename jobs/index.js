'use strict';
const Email = require('./Email');

module.exports = {
  getJobs: function getJobs() {
    return [['email', {}, Email]];
  }
};
