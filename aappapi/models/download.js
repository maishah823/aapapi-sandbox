"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  type: String,
  created_at: Date
},{toJSON:{virtuals:true},toObject:{virtuals:true}});

schema.pre('save', function (next) {
    if (this.isNew){
      this.created_at = Date();
    }
    next();
});

schema.plugin(mongoosePaginate);

schema.post('save', function(doc) {
    Redis.publish('admin','downloadsChanged',doc._id);
});

var Download = mongoose.model('Download', schema);

module.exports = Download;