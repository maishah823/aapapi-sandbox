"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var moment = require('moment');
var mongoosePaginate = require('mongoose-paginate');

// schema
var schema = new Schema({
  firstName:{type:String, required:true},
  lastName:{type:String, required:true},
  school: { type: Schema.Types.ObjectId, ref: 'School', required:true },
  email: { type: String, required: true, unique: true, match:/^.+@.+\..+$/ },
  graduationDate: { type: Date, required: true },
  redeemed: Boolean,
  created_at: Date,
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required:true },
  updated_at: Date,
},{toJSON:{virtuals:true},toObject:{virtuals:true}});

schema.virtual('expiration').get(function() {
    return moment(this.graduationDate).add(1,'year').toDate();
});

schema.virtual('isExpired').get(function() {
    return moment(this.graduationDate).add(1,'year').toDate() < new Date();
});

schema.virtual('fullname').get(function() {
    return this.firstName + ' ' + this.lastName;
});

schema.pre('save', function (next) {
    this.updated_at = Date();
    if (this.isNew){
      this.created_at = Date();
    }
    next();
});

schema.post('save', function(doc) {
    Redis.publish('school','studentDiscountsChanged',doc._id);
});

schema.plugin(mongoosePaginate);

var StudentDiscount = mongoose.model('StudentDiscount', schema);

module.exports = StudentDiscount;