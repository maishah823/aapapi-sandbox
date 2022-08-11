"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');
var moment = require('moment-timezone');


// schema
var schema = new Schema({
  name:{ type:String, required:true},
  conference: { type: Schema.Types.ObjectId, ref: 'Conference', required:true },
  topics: [{ type: Schema.Types.ObjectId, ref:'Topic', required:true}],
  startDateTime: {type:Date,required:true},
  endDateTime: {type:Date,required:true},
  displayDate: String,
  displayStartTime:String,
  displayEndTime:String,
  sortDate:String,
  utcOffset:{type:String,required:true},
  timezone:{type:String,required:true},
  room:{type:String,required:true},
  instructors:[{type:Schema.Types.ObjectId, ref:'User'}],
  files:[String],
  description:String,
  trashed:Boolean,
  created_at: Date,
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required:true },
  updated_at: Date,
},{toJSON:{virtuals:true},toObject:{virtuals:true}});

schema.virtual('duration').get(function () {
    return moment.duration(moment(this.endDateTime).diff(moment(this.startDateTime))).as('hours');
});

schema.virtual('date').get(function () {
    return moment(this.startDateTime).tz(this.timezone).format('MM/DD/YYYY');
});

schema.virtual('startTime').get(function () {
    return moment(this.startDateTime).tz(this.timezone).format('hh:mm A');
});

schema.virtual('endTime').get(function () {
    return moment(this.endDateTime).tz(this.timezone).format('hh:mm A');
});

schema.virtual('materials', {
    ref: 'Material',
    localField: '_id',
    foreignField: 'event'
  });

schema.pre('save', function (next) {
    this.updated_at = Date();
    if (this.isNew){
      this.created_at = Date();
    }
    var startMoment =  moment.tz(this.startDateTime,this.timezone);
    var endMoment =  moment.tz(this.endDateTime, this.timezone);
    this.displayDate = startMoment.format('dddd, MMM DD, YYYY');
    this.displayStartTime = startMoment.format('h:mm A');
    this.displayEndTime = endMoment.format('h:mm A');
    this.sortDate = startMoment.format('YYYYDDMM');

    next();
});

schema.plugin(mongoosePaginate);

schema.post('save', function(doc) {
    Redis.publish('all','classroomEventsChanges',doc._id);
});

var ClassroomEvent = mongoose.model('ClassroomEvent', schema);

module.exports = ClassroomEvent;