/*global describe:false, it:false, beforeEach:false, afterEach:false, request:false*/

'use strict';
global.request = require('supertest');
global.should = require('should');

const fs = require('fs');
const dotenv = require('dotenv');
// Override config with test env
const envConfig = dotenv.parse(fs.readFileSync('.env.test'));
for (var k in envConfig) {
  process.env[k] = envConfig[k];
}

before(function(done) {
  let server = require('../app');
  global.app = server.start(async function() {
    try {
      await db.User.remove();
      await db.User.create({
        name: 'Super Admin',
        password: '12345678',
        type: 'super-admin',
        email: 'longle@siliconprime.com',
        username: 'admin'
      });
      var req = request(global.app)
        .post('/auth')
        .send({
          username: 'admin',
          password: '12345678'
        })
        .expect(200);
      req.end(function(err, resp) {
        global.JWT_TOKEN = (resp && resp.body.token) || '';
        done(err);
      });
    } catch (err) {
      console.log(err);
    }
  });
});

after(function(done) {
  global.app.close(done);
});
