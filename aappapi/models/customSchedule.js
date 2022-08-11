"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');


// schema
var schema = new Schema({
  conf: { type: Schema.Types.ObjectId, ref: 'Conference'},
  classes: [{ type: Schema.Types.ObjectId, ref: 'ClassroomEvent'}],
  user: { type: Schema.Types.ObjectId, ref: 'User'},
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


schema.post('save', function(doc) {
    Redis.publish('all','customScheduleChanged',doc._id);
});

var CustomSchedule = mongoose.model('CustomSchedule', schema);

module.exports = CustomSchedule;