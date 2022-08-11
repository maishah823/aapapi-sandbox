"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');
var Topic = require('./topic');


// schema
var schema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User', required:true, unique:true},
  title: String,
  topics: [{type:Schema.Types.ObjectId,ref:'Topic'}],
  picture: String,
  education:String,
  research:String,
  summary:String,
  active:Boolean,
  created_at: Date,
  updated_at: Date,
},{toJSON:{virtuals:true},toObject:{virtuals:true}});

schema.pre('save', function (next) {
    this.updated_at = Date();
    if (this.isNew){
      this.created_at = Date();
      this.active = true;
      Topic.findOne({name:'General'})
      .then(function(topic){
        this.topics.push(topic._id);
        next();
      }.bind(this))
      .catch(function(err){
        console.error("Couldn't add default GENERAL topic to new instructor: ", err);
        next();
      })
    }else{
      next();
    }
});

schema.plugin(mongoosePaginate);

schema.post('save', function(doc) {
    Redis.publish('all','instructorsChanged',doc._id);
});

var Instructor = mongoose.model('Instructor', schema);

module.exports = Instructor;