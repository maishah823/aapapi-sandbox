"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');


// schema
var schema = new Schema({
  name: {type:String, required:true, unique:true},
  active: Boolean,
  created_at: Date,
  updated_at: Date,
},{toJSON:{virtuals:true},toObject:{virtuals:true}});

schema.virtual('tag').get(function() {
    var tag = this.name.toLowerCase();
    tag = tag.replace(/\s/g,'_');
    return tag;
});

schema.pre('save', function (next) {
    this.updated_at = Date();
    if (this.isNew){
      this.created_at = Date();
      this.active = true;
    }
    next();
});

schema.post('save', function(doc) {
  Redis.syncMongoToRedis();
});

var ChatGroup = mongoose.model('ChatGroup', schema);

module.exports = ChatGroup;