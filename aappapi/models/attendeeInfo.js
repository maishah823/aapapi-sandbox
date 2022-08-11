"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
    conference: { type: Schema.Types.ObjectId, ref: 'Conference' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    invoiceRef: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    checkedIn: Boolean,
    checkedInBy:{ type: Schema.Types.ObjectId, ref: 'User'},
    checkedInAt: Date,
    orderDescription: String,

    guests:[{ type: Schema.Types.ObjectId, ref: 'Guest' }],
    events:[{ type: Schema.Types.ObjectId, ref: 'ExtraEvent' }],

    rate:Number,
    
    finalApproved:Boolean,
    finalApprovedOn:Date,
    finalApprovedBy: { type: Schema.Types.ObjectId, ref: 'User'},

    rejected:Boolean,
    rejectedOn:Date,
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User'},
    rejectedReason:String,

    created_at: Date,
    updated_at: Date,
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.pre('save', function (next) {
    this.updated_at = Date();
    if (this.isNew) {
        this.created_at = Date();
        this.conference = process.env.currentconf;
    }
    next();
});

schema.plugin(mongoosePaginate);

schema.post('save', function (doc) {
    Redis.publish('admin', 'attendeesChanged', doc._id);
});

var AttendeeInfo = mongoose.model('AttendeeInfo', schema);

module.exports = AttendeeInfo;