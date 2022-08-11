"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
  companyName:String,
  firstName:String,
  lastName:String,
  address:{
      street1:String,
      street2:String,
      city:String,
      state:String,
      zip:String,
      country:String,
      workPhone:String
  },
  email:String,
  invoiceNumbers:[String],
  transaction:String,
  qbPayment:String,
  amount:Number,
  manualBy: { type: Schema.Types.ObjectId, ref: 'User'},
  manualOn: Date,
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
    Redis.publish('admin','paymentsChanged',doc._id);
});

var Payment = mongoose.model('Payment', schema);

module.exports = Payment;