/*global describe:false, it:false, beforeEach:false, afterEach:false, app:false*/

'use strict';

const request = require('supertest');

describe('IndexController', function() {
  it('should have route name "index"', function(done) {
    request(app).get('/').expect(200).expect('Content-Type', /html/).expect(/"OK": true/).end(function(err, res) {
      done(err);
    });
  });
});
