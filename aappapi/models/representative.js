"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
  conference: { type: Schema.Types.ObjectId, ref: 'Conference', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, match: /^^.+@.+\..+$/ },
  company: { type: String, required: true },
  address: {
    street1: String,
    street2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    workPhone: String,
    cellPhone: String,
    homePhone: String,
    fax: String

},

  finalApproved: Boolean,
  finalApprovedOn: Date,
  finalApprovedBy: { type: Schema.Types.ObjectId, ref: 'User' },

  rejected: Boolean,
  rejectedOn: Date,
  rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectedReason: String,

  created_at: Date,
  updated_at: Date,
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.pre('save', function (next) {
  this.updated_at = Date();
  if (this.isNew) {
    this.created_at = Date();
  }
  next();
});

schema.plugin(mongoosePaginate);

schema.post('save', function (doc) {
  Redis.publish('admin', 'repChanged', doc._id);
});

var Rep = mongoose.model('Representative', schema);

module.exports = Rep;