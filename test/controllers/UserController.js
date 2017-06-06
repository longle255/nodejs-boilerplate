/*global describe:false, it:false, beforeEach:false, afterEach:false, app:false, JWT_TOKEN: false*/

'use strict';

const request = require('supertest');

describe('UserController', function() {
  it('should get list of users', function(done) {
    var req = request(app).get('/api/users').set('Authorization', JWT_TOKEN).expect(200);
    req.end(function(err, resp) {
      resp.body.status.should.eql(200);
      resp.body.should.not.be.empty();
      done(err);
    });
  });
});
