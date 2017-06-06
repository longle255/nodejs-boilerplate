/*global describe:false, it:false, beforeEach:false, afterEach:false, app:false, JWT_TOKEN: false, request: false*/

'use strict';

describe('AuthController', function() {

  var newUser = {
    name: 'Name Test',
    email: 'test@dropininc.com',
    username: 'testuser',
    password: '12345678'
  };

  it('should create user via register', function(done) {


    var req = request(app).post('/auth/register').send(newUser).expect(200);
    req.end(function(err, resp) {
      resp.body.status.should.eql(200);
      resp.body.data.username.should.eql(newUser.username);
      done(err);
    });
  });

  it('should login by user just registered', function(done) {
    var req = request(app).post('/auth').send({
      email: newUser.email,
      password: newUser.password
    }).expect(200);
    req.end(function(err, resp) {
      resp.body.status.should.eql(200);
      resp.body.token.should.not.be.empty();
      done(err);
    });
  });
});
