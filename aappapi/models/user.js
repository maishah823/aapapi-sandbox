"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require("bcryptjs");
var validator = require("validator");
var Redis = require('../services/redisSvc');
var MembershipApplication = require('./membershipApplication');
var mongoosePaginate = require('mongoose-paginate');
var Conference = require('./conference');
var moment = require('moment');


// schema
var userSchema = new Schema({
    memberNumber: { type: String, unique: true, sparse: true },
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /^^.+@.+\..+$/ },
    address: {
        street1: String,
        street2: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        workPhone: String,
        cellPhone: String,
        homePhone: String,
        fax: String

    },
    customerId: String,
    password: { type: String, required: true, select: false },
    groups: [String],
    isAdmin: Boolean,
    isDelinquentDues: Boolean,
    isMember: Boolean,
    memberLevel: {type:String, enum:['active','affiliate','life','honorary','retired','foreign','tech',undefined]}, //Set during approval
    
    isDeveloper: Boolean,
    isEducator: Boolean,

    isInstructor: Boolean,
    instructorInfo: { type: Schema.Types.ObjectId, ref: 'Instructor' },

    school: { type: Schema.Types.ObjectId, ref: 'School' },
    adminForSchool: { type: Schema.Types.ObjectId, ref: 'School' },

    active: Boolean,
    created_at: Date,
    updated_at: Date,
    passwordIsTemp: Boolean,
    trainingHours: Number,
    duesCurrent: Boolean,
    certNumber: String,
    certExpiration: Date,

    //Reset each conference.
    isAttendee: Boolean,
    attendeePending: Boolean,
    attendeeInfo: { type: Schema.Types.ObjectId, ref: 'AttendeeInfo' },
    attending: { type: Schema.Types.ObjectId, ref: 'Conference' },
    checkedOut: Boolean,
    checkedOutOn: Date,
    
    resetCode: String,
    resetExpire: Date,
    allowReset: Boolean,

    free:Boolean,
    legacy:Boolean,
    needsCreds:Boolean,

    textAuth:Boolean

}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.pre('save', function (next) {

    var user = this;

    this.updated_at = Date();
    if (this.isNew) {
        this.created_at = Date();
        this.active = true;
        this.passwordIsTemp = true;
        this.needsCreds = true;
    }

    if (user.email) {
        user.email = user.email.toLowerCase();
    }

    if (!validator.isEmail(user.email)) {
        return next(new Error('Not a valid email address'));
    }

    if (this.isNew || this.isModified('email')) {
        Redis.client.sismember('used-emails', this.email, (redisError,response) => {
            if(redisError){
                return next(redisError);
            }
            if (response == 0) {

                if (this.isModified('password') || this.isNew) {
                    bcrypt.genSalt(10, function (err, salt) {
                        if (err) {
                            return next(err);
                        }
                        bcrypt.hash(user.password, salt, function (err, hash) {
                            if (err) {
                                return next(err);
                            }
                            user.password = hash;

                            return next();
                        });
                    });
                } else {
                    return next();
                }
            } else {
                return next(new Error("Email previously used."))
                
            }
        });

    } else {


        if (this.isModified('password') || this.isNew) {
            bcrypt.genSalt(10, function (err, salt) {
                if (err) {
                    return next(err);
                }
                bcrypt.hash(user.password, salt, function (err, hash) {
                    if (err) {
                        return next(err);
                    }
                    user.password = hash;

                    return next();
                });
            });
        } else {
            return next();
        }
    }
});

userSchema.post('save', function (doc) {

    Redis.publish('all', 'usersChanged', doc._id);
    Redis.client.sadd('used-emails', doc.email);
    Redis.syncMongoToRedis();

});

userSchema.virtual('memberInfo', {
    ref: 'MembershipApplication',
    localField: '_id',
    foreignField: 'user'
});


userSchema.virtual('chatname').get(function () {
    return this.firstName.split('')[0].toUpperCase() + '. ' + this.lastName;
});

userSchema.virtual('fullname').get(function () {
    return this.firstName + ' ' + this.lastName;
});

userSchema.virtual('certYear').get(function () {
    if(!this.certExpiration){
        return null;
    }
    return moment(this.certExpiration).year().toString();
});

userSchema.virtual('region').get(function () {
    if (this.address.country == "United States") {
        switch (this.address.state) {
            case "AK":
            case "CA":
            case "HI":
            case "ID":
            case "NV":
            case "OR":
            case "WA":
                return 1;
            case "IL":
            case "IN":
            case "IA":
            case "KS":
            case "MI":
            case "MN":
            case "MO":
            case "NE":
            case "ND":
            case "SD":
            case "WI":
                return 2;
            case "CT":
            case "DE":
            case "ME":
            case "MD":
            case "MA":
            case "NH":
            case "NJ":
            case "NY":
            case "OH":
            case "PA":
            case "RI":
            case "VT":
                return 3;
            case "AZ":
            case "CO":
            case "MT":
            case "NM":
            case "OK":
            case "TX":
            case "UT":
            case "WY":
            case "PR":
                return 4;
            case "AL":
            case "FL":
            case "AR":
            case "GA":
            case "KY":
            case "LA":
            case "MS":
            case "NC":
            case "SC":
            case "TN":
            case "VA":
            case "WV":
            case "DC":
                return 5;
            default:
                return 6;
        }
    } else {
        switch (this.address.country) {
            case 'Canada':
                return 1;
            case 'Mexico':
            case 'Honduras':
            case 'Columbia':
                return 4;
            case 'United Kingdom':
                return 5;
            default:
                return 6;
        }
    }
});

userSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

userSchema.plugin(mongoosePaginate);

var User = mongoose.model('User', userSchema);

module.exports = User;