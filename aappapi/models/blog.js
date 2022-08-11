"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
  type:{type:String, enum:['conf','member','public'], required:true},
  title: {type:String, required:true, unique:true},
  body: {type:String, required:true},
  summary: String,
  coverImg: String,
  media: [String],
  archived: Boolean,
  pinned: Boolean,
  created_by: { type: Schema.Types.ObjectId, ref: 'User'},
  created_at: Date,
  updated_at: Date,
},{toJSON:{virtuals:true},toObject:{virtuals:true}});


schema.pre('save', function (next) {
    this.updated_at = Date();
    if (this.isNew){
      this.created_at = Date();
    }
    this.summary = this.summary.substring(0,500);
    next();
});

schema.plugin(mongoosePaginate);

schema.post('save', function(doc) {
    Redis.publish('all','blogChanged',doc._id);
});

var Blog = mongoose.model('Blog', schema);

module.exports = Blog;