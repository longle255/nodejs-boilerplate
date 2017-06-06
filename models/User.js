/**
 * User model
 */
const ROLES = ['user', 'client-admin', 'super-admin'];
const PASSWORD_MINIMUM_LENGHT =6;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const schema = new Schema(
  {
    username: {
      type: String,
      match: [/^[^@\s]+$/, 'Invalid username'],
      required: true,
      unique: true
    },
    password: {
      type: String,
      minlength: PASSWORD_MINIMUM_LENGHT,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    picture: {
      type: String
    },
    phone: {
      type: String
    },
    // status for org administration, managed by admin
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'user'
    },
    lastActivity: {
      type: Date
    }
  },
  {
    collection: 'users',
    timestamps: {},
    strict: true
  }
);

/**
 * Hash the password field of an authenticated user
 * @public
 * @param     user       {Array:User}    User
 * @return                  {Array:User}
 */
function hashPassword(password, callback) {
  bcrypt.hash(password, 10, callback);
}
schema.statics.hashPassword = hashPassword;

// Saves the user's password hashed (plain text password storage is not good)
schema.pre('save', function(next) {
  var user = this;

  if (!this.password || !this.isModified('password')) {
    return next();
  }

  hashPassword(user.password, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

// Create method to compare password input to password saved in database
schema.methods.comparePassword = function(pw) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(pw, this.password, function(err, isMatch) {
      if (err) {
        return reject(err);
      }
      resolve(isMatch);
    });
  });
};

module.exports = mongoose.model('User', schema);
module.exports.ROLES = ROLES;
module.exports.PASSWORD_MINIMUM_LENGHT = PASSWORD_MINIMUM_LENGHT;
