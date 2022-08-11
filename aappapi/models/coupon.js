"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');
var moment = require('moment');


// schema
var schema = new Schema({
  type: {type:String, required:true, enum:['indv','agency','vendor','member-rate']},
  code: {type:String, required:true, unique:true},
  discount: {type:Number, required:true},
  singleUse: Boolean,
  uses: Number,
  expiration: Date,
  created_at: Date,
},{toJSON:{virtuals:true},toObject:{virtuals:true}});

schema.pre('save', function (next) {
    
    if (this.isNew){
      this.created_at = Date();
      this.uses = 0;
      this.expiration = moment().add(10,'months').toDate();
    }
    next();
});

schema.plugin(mongoosePaginate);

schema.post('save', function(doc) {
    Redis.publish('admin','couponsChanged',doc._id);
});


module.exports = mongoose.model('Coupon', schema);