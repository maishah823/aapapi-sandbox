var express = require('express');
var router = express.Router();
var adminGuard = require('../../guards/admin.guard');
var developerGuard = require('../../guards/developer.guard');
var Topic = require('../../models/topic');
var ClassroomEvent = require('../../models/classroomEvent');
var ExtraEvent = require('../../models/extraEvent');
var Instructor = require('../../models/instructor');
var Attendee = require('../../models/attendeeInfo');
var Representative = require('../../models/representative');
var User = require('../../models/user');
var Guest = require('../../models/guest');
var ApiError = require('../../classes/ApiError');
var Redis = require('../../services/redisSvc');
var moment = require('moment-timezone');
var generator = require('generate-password');
var mongoose = require('mongoose');
var Validators = require('../../validators');
var Quickbooks = require('../../services/quickbooks');
var EmailSvc = require('../../services/emailSvc');
var SMSSvc = require('../../services/smsSvc');

router.use(adminGuard);

router.get('/topics', (req, res) => {
    return Topic.find().sort({ name: 1 })
        .then(function (topics) {
            return res.json(topics);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Conference', 'Error fetching topics.'));
        });
});

router.post('/topics', (req, res) => {
    if (!req.body.topic) {
        return res.status(400).send(new ApiError('Conference', 'Insufficient information to add topic.'));
    }
    const newTopic = new Topic({ name: req.body.topic });
    return newTopic.save()
        .then(function (record) {
            return res.json(record);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Conference', 'Error adding topic.'));
        });
});

router.get('/instructors', (req, res) => {
    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var searchQuery;
    var query = { isInstructor: true };
    if (req.query.search) {
        searchQuery = [
            { "lastName": { $regex: new RegExp(req.query.search), $options: 'i' } },
            { "firstName": { $regex: new RegExp(req.query.search), $options: 'i' } },
            { "email": { $regex: new RegExp(req.query.search), $options: 'i' } }
        ];
    }
    if (searchQuery) {
        query = {
            $and: [
                { $or: searchQuery },
                { isInstructor: true }
            ]
        }
    }

    return User.paginate(query, { page: page, limit: limit, sort: { lastName: 1 }, select: 'firstName lastName email instructorInfo', populate: [{ path: 'instructorInfo', populate: [{ path: 'topics' }] }] })
        .then(function (instructors) {
            return res.json(instructors);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Instructors', 'Error fetching instructors.'));
        });
});

router.get('/instructor-dropdown', (req, res) => {
    return User.find({ isInstructor: true }).select('firstName lastName instructorInfo').populate({ path: 'instructorInfo', select: 'topics' })
        .then(function (instructors) {
            return res.json(instructors);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Conference', 'Error identifying available instructors.'));
        });;
});

router.post('/schedule', (req, res) => {

    if (!req.body.event || !req.body.event.description || !req.body.event.room || !req.body.event.startDateTime || !req.body.event.endDateTime || !req.body.event.topics || !req.body.event.instructors || !req.body.event.name) {
        return res.status(400).send(new ApiError('Scheduling', 'Insufficient information to save event.'));
    }

    if (!req.body.event._id || req.body.event._id == 'undefined') {
        if (!req.body.event.conference || !req.body.event.utcOffset || !req.body.event.timezone) {
            return res.status(400).send(new ApiError('Scheduling', 'Cannot save new event without proper timezone information.'));
        }
        let event = new ClassroomEvent(req.body.event);
        event.created_by = req.decoded._id;
        return event.save(event)
            .then(function (savedEvent) {
                var msg = `${req.decoded.name} created ${savedEvent.name} event.`;
                Redis.writeToLog('Conference', msg);
                return res.json({ complete: true });
            })
            .catch(function (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Scheduling', 'Error saving event.'));
            });

    } else {
        return ClassroomEvent.findById(req.body.event._id)
            .then(function (theEvent) {
                theEvent.description = req.body.event.description;
                theEvent.room = req.body.event.room;
                theEvent.startDateTime = req.body.event.startDateTime;
                theEvent.endDateTime = req.body.event.endDateTime;
                theEvent.instructors = req.body.event.instructors;
                theEvent.topics = req.body.event.topics;
                theEvent.name = req.body.event.name;
                return theEvent.save()
                    .then(function (savedEvent) {
                        var msg = `${req.decoded.name} updated ${savedEvent.name} event.`;
                        Redis.writeToLog('Conference', msg);
                        return res.json({ complete: true });
                    })
                    .catch(function (err) {
                        console.error(err);
                        return res.status(500).send(new ApiError('Scheduling', 'Error saving event.'));
                    });

            })
            .catch(function (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Scheduling', 'Error saving event.'));
            });
    }
});

router.post('/event', (req, res) => {

    if (!req.body.event || !req.body.event.description || !req.body.event.room || !req.body.event.startDateTime || !req.body.event.endDateTime || !req.body.event.name) {
        return res.status(400).send(new ApiError('Scheduling', 'Insufficient information to save event.'));
    }

    if (!req.body.event._id || req.body.event._id == 'undefined') {
        if (!req.body.event.conference || !req.body.event.utcOffset || !req.body.event.timezone) {
            return res.status(400).send(new ApiError('Scheduling', 'Cannot save new event without proper timezone information.'));
        }
        let event = new ExtraEvent(req.body.event);
        event.created_by = req.decoded._id;
        return event.save(event)
            .then(function (savedEvent) {
                var msg = `${req.decoded.name} created ${savedEvent.name} event.`;
                Redis.writeToLog('Conference', msg);
                return res.json({ complete: true });
            })
            .catch(function (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Scheduling', 'Error saving event.'));
            });

    } else {
        return ExtraEvent.findById(req.body.event._id)
            .then(function (theEvent) {
                theEvent.description = req.body.event.description;
                theEvent.room = req.body.event.room;
                theEvent.startDateTime = req.body.event.startDateTime;
                theEvent.endDateTime = req.body.event.endDateTime;
                theEvent.cost = req.body.event.cost;
                theEvent.name = req.body.event.name;
                theEvent.credit = req.body.event.credit;
                return theEvent.save()
                    .then(function (savedEvent) {
                        var msg = `${req.decoded.name} updated ${savedEvent.name} event.`;
                        Redis.writeToLog('Conference', msg);
                        return res.json({ complete: true });
                    })
                    .catch(function (err) {
                        console.error(err);
                        return res.status(500).send(new ApiError('Scheduling', 'Error saving event.'));
                    });

            })
            .catch(function (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Scheduling', 'Error saving event.'));
            });
    }
});

router.post('/add-instructor', (req, res) => {
    if (!req.body.instructor) {
        return res.status(400).send(new ApiError('Add Instructor', 'Insufficient Information'));
    }
    var instructor = req.body.instructor;
    if (!instructor.firstName || !instructor.lastName || !instructor.email) {
        return res.status(400).send(new ApiError('Add Instructor', 'Insufficient Information'));
    }

    const password = generator.generate({
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
        strict: true
    });

    instructor.password = password;
    instructor.passwordIsTemp = true;
    instructor.isInstructor = true;
    instructor.needsCreds = true;

    var newUser = new User(instructor);
    const instructorInfo = new Instructor({ user: newUser._id });
    newUser.instructorInfo = instructorInfo;

    newUser.save()
        .then(function (user) {
            instructorInfo.save();
            Redis.sendToWorker('emailNewInstructor', { user: user, password, password });
            Redis.writeToLog('User Updates', `${req.decoded.name} has added an instructor: ${user.firstName} ${user.lastName}`);
            return res.json(user);
        })
        .catch(function (err) {
            if (err.code == 11000) {
                return res.status(400).send(new ApiError('Add Instructor', 'User already exists with this email. Go to user admin to make this user an instructor.'));
            }
            console.error(err);
            return res.status(500).send(new ApiError('Add Instructor', 'Unknown Error. Could not create user.'));
        });
});

router.get('/guestlists', (req, res) => {
    ExtraEvent.find({ conference: mongoose.Types.ObjectId(process.env.currentconf), cost: { $gt: 0 } }).select('_id')
        .then(function (allevents) {
            const aggregate = Guest.aggregate([
                { $match: { conference: mongoose.Types.ObjectId(process.env.currentconf) } },
                {
                    $addFields: {
                        extraevents: { $cond: ['$all', allevents.map(obj => mongoose.Types.ObjectId(obj._id)), '$events'] },
                    }
                },

                {
                    $lookup: {
                        from: "extraevents",
                        localField: "extraevents",
                        foreignField: "_id",
                        as: "event"
                    }
                },
                {
                    $unwind: {
                        path: "$event",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $project: {
                        name: 1,
                        all: 1,
                        event: '$event.name',
                        checkedin: 1
                    }
                },
                { $sort: { name: 1 } },
                {
                    $group: {
                        _id: '$event',
                        guests: { $push: '$$ROOT' }
                    }
                }


            ]);

            aggregate.exec()
                .then(function (items) {
                    res.json(items);
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('Guest Lists', 'Could not retrieve guest lists.'));
                });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Guest Lists', 'Could not retrieve guest lists.'));
        })

});

router.get('/conf-stats', (req, res) => {
    Redis.client.hmget('conf-stats',
        'guests', //0
        'total-attendees',//1
        'approved-attendees',//2
        'paid-attendees',//3
        'attendees-approved-percentage-paid',//4
        'vendors',//5
        'representatives',//6
        'extraevents',//7
        'classroomevents',//8
        'checkedin-attendees',//9
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Stats', 'Could not retrieve overview stats.'));
            }
            statsObj = {
                guests: result[0] || 0,
                totalAttendees: result[1] || 0,
                approvedAttendees: result[2] || 0,
                paidAttendees: result[3] || 0,
                checkedInAttendees: result[9] || 0

            }
            return res.json(statsObj);
        });
});

router.get('/attendees', (req, res) => {

    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var query = {};
    if (req.query.search) {
        query = {
            $or: [
                { "lastName": { $regex: new RegExp(req.query.search), $options: 'i' } },
                { "firstName": { $regex: new RegExp(req.query.search), $options: 'i' } },
                { "email": { $regex: new RegExp(req.query.search), $options: 'i' } }
            ]
        }
    }

    query.attendeeInfo = { $ne: null };

    User.paginate(query, {
        page: page,
        limit: limit,
        select: 'firstName lastName middleName fullname email attendeeInfo address isMember',
        populate: [
            {
                path: 'attendeeInfo', populate: [
                    { path: 'invoiceRef', populate: [{ path: 'payment' }, { path: 'couponCode' }] },
                    { path: 'events', select: 'name startDateTime endDateTime timezone' },
                    { path: 'guests', populate: [{ path: 'events', select: 'name startDateTime endDateTime timezone' }] },
                    { path: 'finalApprovedBy', select: 'firstName lastName' },
                    { path: 'rejectedBy', select: 'firstName lastName' },
                    { path: 'checkedInBy', select: 'firstName lastName' },
                ]
            }
        ],
        sort: [['isAttendee', 1], ['lastName', 1]]

    })
        .then(function (attendees) {
            return res.json(attendees);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Attendees', 'Could not retrieve attendees.'));
        });


});

router.get('/attendees-for-check-in', (req, res) => {

    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var query = {};
    if (req.query.search) {
        query = {
            $or: [
                { "lastName": { $regex: new RegExp(req.query.search), $options: 'i' } },
                { "firstName": { $regex: new RegExp(req.query.search), $options: 'i' } },
                { "email": { $regex: new RegExp(req.query.search), $options: 'i' } }
            ]
        }
    }

    query.attendeeInfo = { $ne: null };

    User.paginate(query, {
        page: page,
        limit: limit,
        select: 'firstName lastName middleName fullname email attendeeInfo address isMember',
        populate: [
            {
                path: 'attendeeInfo', select: 'checkedIn invoiceRef, guests, finalApproved', populate: [
                    { path: 'invoiceRef', select: 'paid' },
                    { path: 'guests', select: 'name' }

                ]
            }
        ],
        sort: [['lastName', 1]]

    })
        .then(function (attendees) {
            return res.json(attendees);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Attendees', 'Could not retrieve attendees.'));
        });


});


router.post('/approve', (req, res) => {
    if (!req.body.userId || !Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('Attendees', 'Oh no! Something happened... the user you wish to approve is unkonwn.'));
    }
    User.findById(req.body.userId)
        .then(function (user) {

            if (user.isAttendee || !user.attendeePending || !user.attendeeInfo) {
                return res.status(400).send(new ApiError('Attendees', 'Something went wrong... this user is not currently waiting approval. Please contact support.'));
            }

            var updates = {
                finalApproved: true,
                finalApprovedOn: new Date(),
                finalApprovedBy: req.decoded._id,
            };
            return Attendee.findByIdAndUpdate(user.attendeeInfo, updates)
                .then(function (attendee) {
                    res.json({ attendee: attendee });
                    Redis.publish('admin', 'attendeesChanged', attendee._id);
                    Redis.sendToWorker('makeAttendee', user._id)
                    Redis.sendToWorker('confstats', 'all');

                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('Attendees', 'Error linking attendee records to user.'));
                });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Attendees', 'Could not retrieve attendee.'));
        });
});

router.post('/reject', (req, res) => {
    if (!req.body.userId || !Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('Attendees', 'Oh no! Something happened... the user you wish to reject is unkonwn.'));
    }
    if (!req.body.reason) {
        return res.status(400).send(new ApiError('Attendees', 'Please supply a reason for rejection.'));
    }
    User.findById(req.body.userId)
        .then(function (user) {

            if (user.isAttendee || !user.attendeePending || !user.attendeeInfo) {
                return res.status(400).send(new ApiError('Attendees', 'Something went wrong... this user is not currently waiting approval. Please contact support.'));
            }

            var updates = {
                rejected: true,
                rejectedOn: new Date(),
                rejectedBy: req.decoded._id,
                rejectedReason: req.body.reason,
            };
            return Attendee.findByIdAndUpdate(user.attendeeInfo, updates)
                .then(function (attendee) {
                    user.isAttendee = false;
                    user.attendeePending = false;
                    return user.save()
                        .then(function (savedUser) {
                            res.json({ attendee: attendee });
                            Redis.publish('admin', 'attendeesChanged', attendee._id);
                            Redis.sendToWorker('confstats', 'all');
                            Redis.sendToWorker('rejectAttendee', { email: savedUser.email, name: savedUser.fullname, reason: req.body.reason });
                            Quickbooks.refund(attendee.invoiceRef, attendee.rate, `${savedUser.fullname} rejected by AAPP. Refunded Fees.`, 'conference')
                                .then(function (result) {
                                    console.log(result);
                                })
                                .catch(function (err) {
                                    console.error(err);
                                });
                        })
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('Attendees', 'Error linking attendee records to user.'));
                });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Attendees', 'Could not retrieve attendee.'));
        });
});

router.post('/checkin', async (req, res) => {
    if (!req.body.userId || !Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('Attendees', 'Oh no! Something happened... the user you wish to check-in is unkonwn.'));
    }

    //Set phone if it's needed.
    var phone;
    if (req.body.phone) {
        phone = req.body.phone.replace(/[\D]/g, "");
        if (phone.length < 10) {
            phone = null;
        }
    }

    var user;
    try {
        user = await User.findById(req.body.userId).populate('attendeeInfo');
        if (!user) {
            throw new Error('Could not find user for check-in');
        }
        if (!user.attendeeInfo) {
            throw new Error('No Attendee Info associated with user for checkin.');
        }
    }
    catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Attendees', 'Oh no! Something happened... the user you wish to check-in is unkonwn.'));

    }

    //Set attendeeId if not already checked in.
    const attendeeId = !user.attendeeInfo.checkedIn ? user.attendeeInfo._id : null;

    if (!user.address) {
        user.address = {};
    }
    if (phone) {
        user.address.cellPhone = phone;
    }
    user.textAuth = req.body.textAuth;

    try {
        await user.save();
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Attendees', 'Oh no! Something happened... the user could not be updated.'));
    }

    if (attendeeId) {
        try {
            await Attendee.findByIdAndUpdate(attendeeId, { checkedIn: true, checkedInBy: req.decoded._id, checkedInAt:new Date() });
            res.json({});
            Redis.publish('admin', 'attendeesChanged', attendeeId);
            Redis.sendToWorker('confstats', 'all');

        } catch (e) {
            console.error(e);
            return res.status(400).send(new ApiError('Attendees', 'Could not check-in user.'));
        }
        if (user.address.cellPhone && user.textAuth) {
            try {
                await SMSSvc.sendMessage(user.address.cellPhone, `You have been checked-in to the AAPP conference by ${req.decoded.name}`);
            } catch (e) {
                console.error(e);
            }
        }
    } else {
        return res.status(400).send(new ApiError('Attendees', 'The attendee has already been checked in.'));

    }
});

router.get('/reps', (req, res) => {
    Redis.client.get('currentconf', (err, conf) => {
        const match = { conference: mongoose.Types.ObjectId(conf) };

        const aggregate = Representative.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "users",
                    localField: "finalApprovedBy",
                    foreignField: "_id",
                    as: "finalApprovedBy"
                }
            },
            {
                $unwind: {
                    path: "$finalApprovedBy",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "rejectedBy",
                    foreignField: "_id",
                    as: "rejectedBy"
                }
            },
            {
                $unwind: {
                    path: "$rejectedBy",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $addFields: {
                    'finalApprovedByName': { $concat: ['$finalApprovedBy.firstName', ' ', '$finalApprovedBy.lastName'] },
                    'rejectedByName': { $concat: ['$rejectedBY.firstName', ' ', '$rejectedBy.lastName'] },
                }
            },
            {
                $project: {
                    'finalApprovedBy': 0,
                    'rejectedBy': 0
                }
            },
            {
                $group: {
                    _id: '$company',
                    reps: { $addToSet: '$$ROOT' },
                    total: { $sum: 1 }
                }
            },
            { $sort: { '_id': -1 } },

        ]);

        return aggregate.exec()
            .then(function (items) {
                return res.json(items);
            })
            .catch(function (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Conference', 'Error fetching vendor reps.'));
            });
    });

});

router.post('/approveRep', (req, res) => {
    if (!req.body.repId || !Validators.isValidObjectId(req.body.repId)) {
        return res.status(400).send(new ApiError('Vendors', 'Oh no! Something happened... the person you wish to approve is unkonwn.'));
    }
    Representative.findById(req.body.repId)
        .then(function (rep) {

            if (rep.finalApproved || rep.rejected) {
                return res.status(400).send(new ApiError('Vendors', 'Something went wrong... this person is not currently waiting approval. Please contact support.'));
            }

            rep.finalApproved = true;
            rep.finalApprovedOn = new Date();
            rep.finalApprovedBy = req.decoded._id;

            return rep.save()
                .then(function (saved) {
                    res.json({ complete: true });

                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('Vendors', 'Error saving changes.'));
                });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Vendors', 'Could not retrieve representative record.'));
        });
});

router.post('/rejectRep', (req, res) => {
    if (!req.body.repId || !Validators.isValidObjectId(req.body.repId)) {
        return res.status(400).send(new ApiError('Vendors', 'Oh no! Something happened... the person you wish to reject is unknown.'));
    }
    if (!req.body.reason) {
        return res.status(400).send(new ApiError('Vendors', 'You must supply a reason to reject.'));
    }
    Representative.findById(req.body.repId)
        .then(function (rep) {

            if (rep.finalApproved || rep.rejected) {
                return res.status(400).send(new ApiError('Vendors', 'Something went wrong... this person is not currently waiting approval. Please contact support.'));
            }

            rep.rejected = true;
            rep.rejectedOn = new Date();
            rep.rejectedBy = req.decoded._id;
            rep.rejectedReason = req.body.reason;

            return rep.save()
                .then(function (saved) {
                    res.json({ complete: true });

                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('Vendors', 'Error saving changes.'));
                });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Vendors', 'Could not retrieve representative record.'));
        });
});

router.get('/rsvps', (req, res) => {

    Redis.client.get('currentconf', async (err, conf) => {
        const match = { conference: mongoose.Types.ObjectId(conf), rejected: { $ne: true } };
        const allevents = await ExtraEvent.find({ conference: mongoose.Types.ObjectId(conf), cost: { $gt: 0 } });
        const aggregate = Attendee.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "extraevents",
                    localField: "events",
                    foreignField: "_id",
                    as: "events"
                }
            },

            {
                $lookup: {
                    from: "guests",
                    localField: "guests",
                    foreignField: "_id",
                    as: "guests"
                }
            },
            { $unwind: { path: '$guests', "preserveNullAndEmptyArrays": true } },

            {
                $lookup: {
                    from: "extraevents",
                    localField: "guests.events",
                    foreignField: "_id",
                    as: "guestevents"
                }
            },

            {
                $project: {


                    events: { '$concatArrays': ['$events', '$guestevents', { $cond: ['$guests.all', allevents, []] }] }


                }
            },
            {
                $match: {
                    "events.cost": { $gt: 0 }
                }
            },
            { $unwind: { path: '$events' } },

            {
                $group: {
                    _id: '$events.name',
                    total: { $sum: 1 }
                }
            }


            // {
            //     $unwind: {
            //         path: "$rsvps"
            //     }
            // },
            // {$group:{
            //     _id:'$rsvps.name',
            //     total: {$sum:1}
            // }}

        ]);

        return aggregate.exec()
            .then(function (items) {
                console.log(allevents)
                return res.json(items);
            })
            .catch(function (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Conference', 'Error fetching vendor reps.'));
            });
    });
});
// router.get('/rsvps', (req, res) => {
//     Redis.client.get('currentconf', (err, conf) => {
//         const match = { conference: mongoose.Types.ObjectId(conf), rejected:{$ne:true} };

//         const aggregate = Attendee.aggregate([
//             { $match: match },
//             {
//                 $lookup: {
//                     from: "extraevents",
//                     localField: "events",
//                     foreignField: "_id",
//                     as: "rsvps"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$rsvps"
//                 }
//             },
//             {$group:{
//                 _id:'$rsvps.name',
//                 total: {$sum:1}
//             }}

//         ]);

//         return aggregate.exec()
//             .then(function (items) {
//                 return res.json(items);
//             })
//             .catch(function (err) {
//                 console.error(err);
//                 return res.status(500).send(new ApiError('Conference', 'Error fetching vendor reps.'));
//             });
//     });
// });

router.get('/delete-event/:id', (req, res) => {
    const eventId = req.params['id'];
    if (!Validators.isValidObjectId(eventId)) {
        return res.status(400).send(new ApiError('Conference', 'Could not identify event you wish to delete'));
    }
    ExtraEvent.findByIdAndUpdate(eventId, { trashed: true })
        .then(function () {

            return res.json({ success: true });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(400).send(new ApiError('Conference', 'Error deleting event.'));
        });
});

router.get('/delete-class/:id', (req, res) => {

    const classId = req.params['id'];
    if (!Validators.isValidObjectId(classId)) {
        return res.status(400).send(new ApiError('Conference', 'Could not identify event you wish to delete'));
    }
    ClassroomEvent.findByIdAndUpdate(classId, { trashed: true })
        .then(function () {
            return res.json({ success: true });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(400).send(new ApiError('Conference', 'Error deleting classroom event.'));
        });
});

router.post('/refund-attendee', async (req, res) => {
    if (!Validators.isValidObjectId(req.body.attendeeId)) {
        return res.status(400).send(new ApiError('Conference', 'Could not identify the user you wish to revoke.'));
    }

    User.findById(req.body.attendeeId).populate([
        { path: 'attendeeInfo', populate: [{ path: 'invoiceRef', populate: [{ path: 'payment' }] }] }
    ])
        .then(async function (user) {
            console.log(user);
            if (!user.attendeeInfo) {
                return res.status(400).send(new ApiError('Conference', 'The user does not seem to be an attendee.'));
            }
            if (!user.attendeeInfo.invoiceRef) {
                return res.status(400).send(new ApiError('Conference', 'The user does not seem associated with a registration invoice.'));
            }
           

            let invoiceAmount = user.attendeeInfo.invoiceRef.amount;
            let isPaid = user.attendeeInfo.invoiceRef.paid;
            let attendeeInfoId = user.attendeeInfo._id;

            //Check if the associated invoice is 0, if so, just remove attendee and log.
            if (!invoiceAmount || invoiceAmount <= 0) {
                try {
                    await User.findByIdAndUpdate(user._id, { attendeeInfo: null, isAttendee: null, attendeePending: false });
                    await Attendee.findByIdAndRemove(attendeeInfoId);
                } catch (e) {
                    console.error(e);
                    return res.status(400).send(new ApiError('Conference', 'There was an issue with this action. Contact technical support.'));
                }
                return EmailSvc.sendGeneralEmail([{ email: user.email, name: user.fullname }], 'As requested, your conference registration has been cancelled.', 'AAPP Conference Registration', 'AAPP Board of Directors')
                    .then(function () {
                        Redis.writeToLog('Refund', `The conference registration for ${user.fullname} was cancelled by ${req.decoded.name}`);
                        return res.json({});
                    });

            }

            let userRate = user.attendeeInfo.rate;
            if (!userRate || (invoiceAmount < userRate)) {
                console.error("The user cannot be cancelled because there is no rate associated with them.");
                return res.status(400).send(new ApiError('Conference', 'There was an issue with this action. Contact technical support.'));

            }

            return Quickbooks.refund(user.attendeeInfo.invoiceRef._id, userRate, `Withdrawl of registration for ${user.fullname}`, 'conference')
                .then(async () => {
                    await User.findByIdAndUpdate(user._id, { attendeeInfo: null, isAttendee: null, attendeePending: false });
                    await Attendee.findByIdAndRemove(attendeeInfoId);


                    res.json({});
                    Redis.writeToLog('Refund', `The conference registration for ${user.fullname} was cancelled by ${req.decoded.name}`);
                    await EmailSvc.sendGeneralEmail([{ email: user.email, name: user.fullname }], 'As requested, your conference registration has been cancelled. If payment had already been made, it has been refunded.', 'AAPP Conference Registration', 'AAPP Board of Directors')
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(400).send(new ApiError('Conference', 'The action was only partially completed. Contact technical support immediately.'));

                });
        });
});

router.post('/duplicate-search', (req, res) => {
    console.log(req.body);
    var lastName = req.body.lastName || '';
    return User.find({ lastName: { "$regex": lastName, $options: "i" }, isMember: true })
        .select('firstName lastName address email')
        .limit(20)
        .then(function (users) {
            return res.json(users);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(400).send(new ApiError('Conference', 'Could not query users.'));

        });
});

router.post('/link-member', async (req, res) => {
    if (!Validators.isValidObjectId(req.body.newId) || !Validators.isValidObjectId(req.body.realId)) {
        return res.status(400).send(new ApiError('Conference', 'Could not identify the users you wish to link.'));
    }
    try {
        var fakeUser = await User.findById(req.body.newId);
        var realUser = await User.findById(req.body.realId);
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Conference', 'There was an issue finding the accounts to link.'));
    }

    if (!fakeUser || !realUser) {
        return res.status(400).send(new ApiError('Conference', 'Could not find the two accounts you wish to link.'));
    }

    var logMessage = `${req.decoded.name} merged attendee ${fakeUser.fullname} with member ${realUser.fullname}`;
    //Update the real user and delete:
    var updates = {
        finalApproved: true,
        finalApprovedOn: new Date(),
        finalApprovedBy: req.decoded._id,
        user: realUser._id
    };

    console.log(fakeUser, realUser, logMessage);
    var attendeeInfoId = fakeUser.attendeeInfo;
    try {
        await Redis.client.srem('used-emails', fakeUser.email);
        await User.findByIdAndUpdate(req.body.newId, { email: 'override@policepolygraph.org' });
        await User.findByIdAndUpdate(req.body.realId, { attendeeInfo: fakeUser.attendeeInfo, isAttendee: true, email: fakeUser.email });
        await Attendee.findByIdAndUpdate(attendeeInfoId, updates);

    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Conference', 'There was an issue linking the accounts.'));
    }

    if (req.body.newId != req.body.realId) {
        try {
            await User.findByIdAndRemove(req.body.newId);
        } catch (e) {
            console.log(e);
            return res.status(400).send(new ApiError('Conference', 'Merged but was unable to remove the old record.'));

        }
    }
    res.json({})
    Redis.writeToLog('Merges', logMessage);
    Redis.publish('admin', 'attendeesChanged', attendeeInfoId);
    //MAKE THE INVOICE RIGHT
    Redis.sendToWorker('adjustInvoiceOnMerge', { attendeeInfo: attendeeInfoId });
});

router.get('/trigger-checkout-reminders',(req,res)=>{
    Redis.sendToWorker('checkoutReminder',{});
    Redis.writeToLog('Reminders', req.decoded.name + " triggered checkout reminder emails.");
    res.json({});
});

router.get('/clear-registrations',developerGuard,(req,res)=>{
    User.find()
    .then(users=>{
        removeRegRecursive(users);
        res.json({});
    });
});

async function removeRegRecursive(users){
    if (!users || users.length < 1){
        return;
    }
    let user = users.pop();
    await User.findByIdAndUpdate(user._id,{ attendeeInfo: null, isAttendee: null, attendeePending: false });
    removeRegRecursive(users);
}

module.exports = router;