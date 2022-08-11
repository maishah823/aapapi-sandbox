"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
  name: {type:String, required:true, unique:true},
  address: {
      street:String,
      city: String,
      state: String,
      zip:String,
      country:String
  },
  director: String,
  internSupervisor: String,
  phone: String,
  verified:Boolean,
  active:Boolean,
  created_at: Date,
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required:true },
  updated_at: Date,
},{toJSON:{virtuals:true},toObject:{virtuals:true}});

schema.virtual('educators', {
    ref: 'User',
    localField: '_id',
    foreignField: 'adminForSchool'
  });


schema.pre('save', function (next) {
    this.updated_at = Date();
    if (this.isNew){
      this.created_at = Date();
      this.active = true;
      if(!this.country){
          this.country = "United States";
      }
    }
    next();
});

schema.plugin(mongoosePaginate);

schema.post('save', function(doc) {
    Redis.publish('school','schoolsChanged',doc._id);
});

var School = mongoose.model('School', schema);

module.exports = School;