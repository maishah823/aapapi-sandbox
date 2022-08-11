"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
  type:{type:String, enum:['member','public','2019conference'], required:true},
  caption:String,
  album: String,
  filename:String,
  created_by: { type: Schema.Types.ObjectId, ref: 'User'},
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
    Redis.publish('all','galleryItemsChanged',doc._id);
});

var GalleryItem = mongoose.model('GalleryItem', schema);

module.exports = GalleryItem;