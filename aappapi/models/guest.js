"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
  conference: { type: Schema.Types.ObjectId, ref: 'Conference', required:true },
  name: {type:String, required:true},
  all: Boolean,
  paid:Boolean,
  events:[{ type: Schema.Types.ObjectId, ref: 'ExtraEvent' }],
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
    Redis.publish('admin','guestsChanged',doc._id);
});

var Guest = mongoose.model('Guest', schema);

module.exports = Guest;