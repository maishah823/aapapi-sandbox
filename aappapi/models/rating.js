"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required:true },
  conference: { type: Schema.Types.ObjectId, ref: 'Conference', required:true },
  class: { type: Schema.Types.ObjectId, ref: 'ClassroomEvent',required:true },
  rating: {type:Number, required:true},
  comment: String,
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
    Redis.publish('admin','ratingsChanged',doc._id);
});

var Rating = mongoose.model('Rating', schema);

module.exports = Rating;