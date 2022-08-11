"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// schema
var schema = new Schema({
  code: {type:String, required:true},
  expiration: {type:Date,required:true},
  user: { type: Schema.Types.ObjectId, ref: 'User', required:true },
});

var FirstUseCode = mongoose.model('FirstUseCode', schema);


module.exports = FirstUseCode;