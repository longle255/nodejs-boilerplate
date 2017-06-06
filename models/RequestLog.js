'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var schema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User'
  },
  path: {
    type: String
  },
  method: {
    type: String
  },
  ip: {
    type: String
  },
  reqHeader: {
    type: Object
  },
  reqQuery: {
    type: Object
  },
  reqBody: {
    type: Object
  },
  resCode: {
    type: Number
  },
  resBody: {
    type: String
  }
}, {
  collection: 'request-logs',
  timestamps: {},
  strict: true,
  useNestedStrict: true
});

module.exports = mongoose.model('RequestLog', schema);
