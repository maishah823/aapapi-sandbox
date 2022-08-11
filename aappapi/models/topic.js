"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
  name: {type:String, required:true, unique:true},
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
    Redis.publish('admin','topicsChanged',doc._id);
});

var Topic = mongoose.model('Topic', schema);

module.exports = Topic;