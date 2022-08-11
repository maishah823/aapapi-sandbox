"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User'},
  invoiceRef: {type:String, unique:true, required:true},
  invoiceNumber: {type:String, unique:true, required:true},
  type:String,
  memo:String,
  amount:Number,
  paid:Boolean,
  comped:Boolean,
  couponCode:{ type: Schema.Types.ObjectId, ref: 'Coupon' },
  discount:Number,
  payment:{ type: Schema.Types.ObjectId, ref: 'Payment' },
  created_at: Date,
  updated_at: Date,
},{toJSON:{virtuals:true},toObject:{virtuals:true}});


schema.pre('save', function (next) {
    this.updated_at = Date();
    if (this.isNew){
      this.created_at = Date();
    }
    next();
});

schema.plugin(mongoosePaginate);

schema.post('save', function(doc) {
    Redis.publish('admin','invoicesChanged',doc._id);
});

var Invoice = mongoose.model('Invoice', schema);

module.exports = Invoice;