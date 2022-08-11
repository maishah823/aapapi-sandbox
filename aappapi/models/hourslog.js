"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  conference: { type: Schema.Types.ObjectId, ref: 'Conference' },
  classes: [{class:{ type: Schema.Types.ObjectId, ref: 'ClassroomEvent' },hours:Number, rating:Number, comment:String, name:String}],
  events: [{event:{ type: Schema.Types.ObjectId, ref: 'ExtraEvent' },hours:Number, rating:Number, comment:String, name:String}],
  organization:Number,
  relevance:Number,
  issues:Number,
  hotel:Number,
  location:Number,
  comments:String,
  totalHours: {type:Number, required:true},
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
    Redis.publish('admin','hoursLogChanged',doc._id);
});

var HoursLog = mongoose.model('HoursLog', schema);

module.exports = HoursLog;