"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var Redis = require('../services/redisSvc');


// schema
var changelogSchema = new Schema({
  created_at: Date,
  logType: String,
  logMessage: {type:String,required:true}
});

changelogSchema.pre('save', function (next) {
    
  if (this.isNew){
    this.created_at = Date();
  }

  return next();

});

changelogSchema.post('save', function(doc) {

  Redis.publish('all','changelogChanged','Change Log Changed');

    
});


changelogSchema.plugin(mongoosePaginate);

var ChangeLog = mongoose.model('ChangeLog', changelogSchema);


module.exports = ChangeLog;