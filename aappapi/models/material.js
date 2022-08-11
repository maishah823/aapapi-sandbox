"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
  instructor: { type: Schema.Types.ObjectId, ref: 'User'},
  event: { type: Schema.Types.ObjectId, ref: 'ClassroomEvent'},
  title: {type:String, required:true},
  filename: {type:String, required:true},
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
    Redis.publish('all','materialsChanged',doc._id);
});

var Material = mongoose.model('Material', schema);

module.exports = Material;