"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment-timezone');

// schema
var schema = new Schema({
  city:{type:String,required:true},
  state:{type:String,required:true},
  timezone: {type:String,required:true},
  utcOffset:{type:String,required:true},
  startDateTime: {type:Date,unique:true, required:true},
  endDateTime: {type:Date,unique:true, required:true},
  memberPrice: [{type:Number, required:true}],
  memberEarlyPrice:[{type:Number, required:true}],
  nonMemberPrice:[{type:Number, required:true}],
  nonMemberEarlyPrice:[{type:Number, required:true}],
  vendorPrice:[{type:Number, required:true}],
  vendorPriceEarly: [{type:Number, required:true}],
  guestPrice: [{type:Number, required:true}]
},{toJSON:{virtuals:true},toObject:{virtuals:true}});

schema.virtual('year').get(function () {
    return moment(this.startDateTime).year();
});

schema.virtual('start').get(function () {
    return moment(this.startDateTime).tz(this.timezone).format('MM-DD-YYYY hh:mm A z');
});

schema.virtual('end').get(function () {
    return moment(this.endDateTime).tz(this.timezone).format('MM-DD-YYYY hh:mm A z');
});

var Conference = mongoose.model('Conference', schema);

module.exports = Conference;