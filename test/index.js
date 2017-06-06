/*global describe:false, it:false, beforeEach:false, afterEach:false*/

'use strict';

const request = require('supertest');
const fs = require('fs');
const dotenv = require('dotenv');

// Override config with test env
const envConfig = dotenv.parse(fs.readFileSync('.env.test'));
for (var k in envConfig) {
  process.env[k] = envConfig[k];
}

require('dotenv').config({ silent: true });

describe('index', function() {
  var app, mock;

  beforeEach(function(done) {
    app = require('../index');
    app.on('start', done);
    mock = app.listen(1337);
  });

  afterEach(function(done) {
    mock.close(done);
  });

  it('should have route name "index"', function(done) {
    request(mock).get('/').expect(200).expect('Content-Type', /html/).expect(/"OK": true/).end(function(err, res) {
      done(err);
    });
  });
});
