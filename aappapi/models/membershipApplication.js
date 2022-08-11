"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Redis = require('../services/redisSvc');
var mongoosePaginate = require('mongoose-paginate');


// schema
var schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique:true },
    citizen: Boolean,
    isLicensed: Boolean,
    licenseNumber: String,
    licenseList: String,
    school: { type: Schema.Types.ObjectId, ref: 'School' },
    schoolName: String,
    internSup: String,
    schoolDirector: String,
    schoolStreet: String,
    schoolCity: String,
    schoolState: String,
    schoolZip: String,
    schoolPhone: String,
    graduationDate: Date,
    memberClass: String,
    yearsExperience: Number,
    examsConducted: Number,
    techniques: String,
    otherOrgs: String,
    beenDienied: Boolean,
    denialExplaination: String,
    employmentStatus: String,
    employmentAddress: {
        street1: String,
        street2: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        workPhone: String
    },
    employmentAgency: String,
    supervisorName: String,
    supervisorPhone: String,
    supervisorEmail: String,
    hireDate: Date,
    seperationDate: Date,
    sperationType: String,
    convicted: Boolean,
    dischargedGov: Boolean,
    dischargedOrg: Boolean,
    ref1: {
        name: String,
        agency: String,
        email: String,
        phone: String
    },
    ref2: {
        name: String,
        agency: String,
        email: String,
        phone: String
    },
    ref3: {
        name: String,
        agency: String,
        email: String,
        phone: String
    },

    invoiceRef: { type: Schema.Types.ObjectId, ref: 'Invoice' },

    hasSchoolDiscount: Boolean,
    paymentType: String,
    // paid:Boolean,
    // paidOn:Date,

    regionApproved:Boolean,
    regionApprovedOn:Date,
    regionApprovedBy: { type: Schema.Types.ObjectId, ref: 'User'},

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
    }
    next();
});

schema.plugin(mongoosePaginate);

schema.post('save', function (doc) {
    Redis.publish('membershipApplicationsChanged', 'membershipApplicationsChanged', doc._id);
});

var MembershipApplication = mongoose.model('MembershipApplication', schema);

module.exports = MembershipApplication;