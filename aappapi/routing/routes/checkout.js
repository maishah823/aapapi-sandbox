var express = require('express');
var router = express.Router();
var adminGuard = require('../../guards/admin.guard');
var confGuard = require('../../guards/conf.guard');
var User = require('../../models/user');
var HoursLog = require('../../models/hourslog');
var ClassroomEvent = require('../../models/classroomEvent');
var Event = require('../../models/extraEvent');
var HoursLog = require('../../models/hourslog');
var Redis = require('../../services/redisSvc');
var q = require('q');
var ApiError = require('../../classes/ApiError');
var mongoose = require('mongoose');
var moment = require('moment-timezone');
var pdf = require('../../services/pdfCreator');
var Utils = require('../../services/utils');


// router.get('/', confGuard, (req, res) => {
//     Redis.client.get('currentconf', (err, conf) => {
//         if (err) {
//             return res.status(500).send(new ApiError('Conference', 'Could not determine conference.'));
//         }
//         return ClassroomEvent.find({ conference: conf, trashed: { $ne: true } }).sort({ created_at: -1 })
//             .select('instructors name startDateTime endDateTime timezone')
//             .populate([{ path: 'instructors', select: 'firstName lastName' }])
//             .then(function (items) {
//                 return res.json(items);
//             })
//             .catch(function (err) {
//                 console.error(err);
//                 return res.status(500).send(new ApiError('Conference', 'Error fetching classes.'));
//             });
//     });

// });

router.get('/', confGuard, async (req, res) => {
    var conf;
    var classes;
    var events;
    try {
        conf = await Redis.getCurrentConference();
        if (!conf) {
            throw new Error("CHECKOUT: Couldn't find current conference");
        }
        classes = await ClassroomEvent.find({ conference: conf, trashed: { $ne: true } }).sort({ created_at: -1 })
            .select('instructors name startDateTime endDateTime timezone displayDate displayStartTime')
            .populate([{ path: 'instructors', select: 'firstName lastName' }]);
        if (!classes) {
            classes = [];
        }
        events = await Event.find({ conference: conf, trashed: { $ne: true }, credit: true })
            .select('name startDateTime endDateTime timezone displayDate displayStartTime');

        if (!events) {
            events = [];
        }

    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Conference', 'Error fetching classes.'));
    }

    return res.json([...classes.map(
        (course) => {
            return Object.assign(course.toJSON(), { type: 'classroom' });
        }), ...events.map(
            (event) => {
                return Object.assign(event.toJSON(), { type: 'event' });
            })].sort((a, b) => {
                if (a.startDateTime > b.startDateTime) {
                    return 1;
                } else if (a.startDateTime < b.startDateTime) {
                    return -1;
                } else {
                    return 0;
                }
            }));

});

router.post('/', confGuard, async (req, res) => {


    var filename = 'Certificate';
    var email;
    var user;
    var conf;
    var totalHours = 0;
    if (!req.body.courses) {
        return res.status(400).send(new ApiError('Bluesheet', 'No data transmitted.'));
    }
    try {
        conf = await Redis.getCurrentConference();
        if (!conf) {
            throw new Error("CHECKOUT: Could not determine current conference.");
        }
        user = await User.findById(req.decoded._id).populate('attendeeInfo');
        if (!user) {
            throw new Error("CHECKOUT: Could not find user.");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Bluesheet', 'Error checking out. Please contact technical support.'));
    }
    if (!user.isAttendee) {
        return res.status(400).send(new ApiError('Bluesheet', 'You are not registered as an attendee.'));
    }
    if (!user.attendeeInfo.checkedIn) {
        return res.status(400).send(new ApiError('Bluesheet', 'You were never checked IN. Please see someone from the board or national office.'));
    }
    if (user.checkedOut) {
        return res.status(400).send(new ApiError('Bluesheet', 'You are already checked out.'));
    }


    for (var i = 0; i < req.body.courses.length; i++) {
        const course = req.body.courses[i];
        totalHours = totalHours + parseFloat(course.hoursAttended);
    }

    const hoursLog = new HoursLog({
        user: user._id,
        conference: conf,
        classes: req.body.courses.filter(course => course.type == 'classroom').map(course => {
            return {
                class: course.id,
                hours: parseFloat(course.hoursAttended || 0),
                rating: course.score || 0,
                comment: course.comment,
                name: course.name
            };
        }),
        events: req.body.courses.filter(course => course.type == 'event').map(course => {
            return {
                event: course.id,
                hours: parseFloat(course.hoursAttended || 0),
                rating: course.score || 0,
                comment: course.comment,
                name: course.name
            };
        }),
        organization: req.body.organization || 0,
        relevance: req.body.relevance || 0,
        issues: req.body.issues || 0,
        hotel: req.body.hotel || 0,
        location: req.body.location || 0,
        comments: req.body.comments,
        totalHours: totalHours
    });

    try {
        await hoursLog.save();
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Bluesheet', 'Error checking out.'));

    }
    try {
        await User.findByIdAndUpdate(req.decoded._id, { checkedOut: true, checkedOutOn: new Date() });
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Bluesheet', 'Error checking out.'));
    }

    var data = "";
    for (var i = 0; i < hoursLog.classes.length; i++) {
        data = data + hoursLog.classes[i].hours + " hours - " + hoursLog.classes[i].name + "\n";
    }
    for (var i = 0; i < hoursLog.events.length; i++) {
        data = data + hoursLog.events[i].hours + " hours - " + hoursLog.events[i].name + "\n";
    }

    if (process.env.NODE_ENV == 'development') {
        data = data + "\nThis is a test document, intended for development purposes. It does not represent an official attendance log.";
    }

    //EMAIL CERT, DOWNLOAD CERT
    var payload = {
        name: user.fullname,
        total: "TOTAL HOURS: " + hoursLog.totalHours,
        data: data,
        email: user.email

    }

    return pdf.generateCert(payload)
        .then(function (result) {
            if (!result) {
                return res.status(400).send(new ApiError('Bluesheet', 'Could not generate certificate.'));
            }
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=AAPP_Bluesheet.pdf',
                'Content-Length': result.length
            });
            res.end(result);
            Redis.sendToWorker('sendCertificate', payload);
            return;
        })
        .catch(function (err) {
            console.error("CHECKOUT ERROR: ", err);
            return res.status(400).send(new ApiError('Bluesheet', 'Could not generate certificate.'));
        });



});


router.get('/stats-overview', (req, res) => {
    Redis.client.get('currentconf', (err, conf) => {
        if (err) {
            return res.status(500).send(new ApiError('Conference', 'Could not determine conference.'));
        }
        //REFACTOR THIS TO CHECK BEFORE REDIS CALL
        if(req.query.conf){
            conf = req.query.conf;
        }
        const match = { conference: mongoose.Types.ObjectId(conf) };

        const aggregate = HoursLog.aggregate([
            { $match: match },
            {
                $facet: {
                    classRatings: [
                        {
                            $project: {
                                classes: { $concatArrays: ['$classes', '$events'] }
                            }
                        },

                        { $unwind: '$classes' },
                        //Determine Type
                        {
                            $addFields: {
                                'courseId': { $cond: { if: '$classes.class', then: '$classes.class', else: '$classes.event' } },
                                'type': { $cond: { if: '$classes.class', then: 'class', else: 'event' } }
                            }
                        },
                        {
                            $group: {
                                _id: { name: '$classes.name', type: '$type', _id: '$courseId' },
                                rating: { $sum: '$classes.rating' },
                                comments: { $sum: { $cond: { if: '$classes.comment', then: 1, else: 0 } } },
                                total: { $sum: 10 },
                                votes: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                rating: { $divide: [{ $multiply: ['$rating', 10] }, '$total'] },
                                votes: 1,
                                comments: 1
                            }
                        },
                        { $sort: { 'rating': -1 } }
                    ],
                    generalRatings: [
                        {
                            $project: {
                                organization: 1,
                                relevance: 1,
                                issues: 1,
                                hotel: 1,
                                location: 1,
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                organization: { $sum: '$organization' },
                                relevance: { $sum: '$relevance' },
                                issues: { $sum: '$issues' },
                                hotel: { $sum: '$hotel' },
                                location: { $sum: '$location' },
                                total: { $sum: 10 },
                                votes: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                organization: { $divide: [{ $multiply: ['$organization', 10] }, '$total'] },
                                relevance: { $divide: [{ $multiply: ['$relevance', 10] }, '$total'] },
                                issues: { $divide: [{ $multiply: ['$issues', 10] }, '$total'] },
                                hotel: { $divide: [{ $multiply: ['$hotel', 10] }, '$total'] },
                                location: { $divide: [{ $multiply: ['$location', 10] }, '$total'] },
                                votes: 1
                            }
                        }
                    ]
                }
            }
        ]);
        return aggregate.exec()
            .then(function (items) {
                console.log(JSON.stringify(items))
                return res.json(items[0]);
            })
            .catch(function (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Conference', 'Error fetching class stats.'));
            });
    });

});

// router.get('/comments', (req, res) => {
//     Redis.client.get('currentconf', (err, conf) => {
//         if (err || !conf) {
//             return res.status(500).send(new ApiError('Conference', 'Could not determine conference.'));
//         }
//         var query = {
//             conference: conf,
//             $or: [
//                 { "classes": { $elemMatch: { comment: { $ne:null, $exists:true,$ne:""} } } },
//                 { "events": { $elemMatch: { comment: { $ne:null, $exists:true,$ne:""} } } },
//                 { "comments": { $ne:null, $exists:true, $ne:""} }  
//             ]

//         };

//         const limit = parseInt(req.query.limit || 10);
//         const page = parseInt(req.query.page || 1);

//         return HoursLog.paginate(query, {
//             page: page, limit: limit,
//             populate: [
//                 { path: 'user', select: 'firstName lastName title' },
//             ]
//         }).then(function (result) {
//             console.log(result.docs[0])
//             result.docs = result.docs.map(log => {
//                 return {
//                     name: log.user.fullname,
//                     overall: (((log.organization || 0) + (log.relevance || 0) + (log.issues || 0) + (log.hotel || 0) + (log.location || 0)) / 50) * 10,
//                     future: log.comments || null,
//                     comments: [...log.classes.map(course => {
//                         return course.comment ? { name: course.name, comment: course.comment } : null;
//                     }).filter(comment => comment),
//                     ...log.events.map(course => {
//                         return course.comment ? { name: course.name, comment: course.comment } : null;
//                     }).filter(comment => comment)]
//                 }
//             });
//             console.log(JSON.stringify(result.docs));
//             return res.json(result);
//         })
//             .catch(function (err) {
//                 console.error(err);
//                 return res.status(500).send(new ApiError('Comments', 'Could not retrieve comments.'));
//             });
//     });
// });


router.get('/hours-logs', adminGuard, async (req, res) => {

    var mainQuery = { user: { $ne: null } };
    if (req.query.conf) {
        mainQuery.conference = mongoose.Types.ObjectId(req.query.conf);
    } else {
        try {
            var conference = await Redis.getCurrentConference();
            mainQuery.conference = mongoose.Types.ObjectId(conference);
        } catch (e) {
            console.error(e);
        }
    }



    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const skip = (page - 1) * limit;
    var query = {};
    if (req.query.search) {
        query = {
            $or: [
                { "name": { $regex: new RegExp(req.query.search), $options: 'i' } },
                { "email": { $regex: new RegExp(req.query.search), $options: 'i' } }
            ]
        }
    }

    const aggregate = HoursLog.aggregate([
        { $match: mainQuery },
        {
            $facet: {
                records: [
                    {
                        $lookup:
                        {
                            from: 'users',
                            localField: 'user',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    { $unwind: '$user' },
                    {
                        $addFields: {
                            lastName: '$user.lastName',
                            firstName: '$user.firstName',
                            name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                            email: '$user.email'
                        }
                    },
                    {
                        $project: {
                            user: 0
                        }
                    },
                    { $match: query },
                    { $sort: { lastName: 1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                total: [
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 }
                        }
                    }
                ]
            }
        }



    ]);
    return aggregate.exec()
        .then(function (result) {
            const output = result[0];
            let total = 0;
            if(output.total.length > 0) total = output.total[0].count || 0;
            return res.json({ docs: output.records, page, limit, total: total});
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Hours Logs', 'Error fetching logs.'));
        });

});

router.post('/generate-bluesheet', adminGuard, async (req, res) => {

    var type = req.body.type || 'download';

    if (!req.body.id) {
        return res.status(400).send(new ApiError('Bluesheet', 'Can not determine which bluesheet you want.'));
    }

    var hoursLog;

    try {
        hoursLog = await HoursLog.findById(req.body.id).populate('user');
        if (!hoursLog) { throw new Error("BLUESHEET DOWNLOAD: Could not find bluesheet") }
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Bluesheet', 'Error retrieving bluesheet.'));

    }

    var data = "";
    for (var i = 0; i < hoursLog.classes.length; i++) {
        data = data + hoursLog.classes[i].hours + " hours - " + hoursLog.classes[i].name + "\n";
    }
    for (var i = 0; i < hoursLog.events.length; i++) {
        data = data + hoursLog.events[i].hours + " hours - " + hoursLog.events[i].name + "\n";
    }

    if (process.env.NODE_ENV == 'development') {
        data = data + "\nThis is a test document, intended for development purposes. It does not represent an official attendance log.";
    }

    //EMAIL CERT, DOWNLOAD CERT
    var payload = {
        name: hoursLog.user.fullname,
        total: "TOTAL HOURS: " + hoursLog.totalHours,
        data: data,
        email: hoursLog.user.email

    };

    if (process.env.NODE_ENV == 'development') {
        payload.email = 'gregharkins@harcomtech.com';
    }

    if (type == 'download') {

        return pdf.generateCert(payload)
            .then(function (result) {
                if (!result) {
                    return res.status(400).send(new ApiError('Bluesheet', 'Could not generate certificate.'));
                }
                res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename=AAPP_Bluesheet.pdf',
                    'Content-Length': result.length
                });
                res.end(result);

            })
            .catch(function (err) {
                console.error("CHECKOUT ERROR: ", err);
                return res.status(400).send(new ApiError('Bluesheet', 'Could not generate certificate.'));
            });
    } else if (type == 'email') {
        Redis.sendToWorker('sendCertificate', payload);
        return res.json({});
    } else {
        return res.status(400).send(new ApiError('Bluesheet', 'Could not determine how you want to deliver the bluesheet.'));
    }



});

router.get('/comments', adminGuard, async (req, res) => {

    var mainQuery = { user: { $ne: null } };
    if (req.query.conference) {
        mainQuery.conference = mongoose.Types.ObjectId(req.query.conference);
    } else {
        try {
            var conference = await Redis.getCurrentConference();
            mainQuery.conference = mongoose.Types.ObjectId(conference);
        } catch (e) {
            console.error(e);
        }
    }



    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const skip = (page - 1) * limit;
    var query = {};
    if (req.query.search) {
        query = {
            $or: [
                { "name": { $regex: new RegExp(req.query.search), $options: 'i' } },
                { "email": { $regex: new RegExp(req.query.search), $options: 'i' } }
            ]
        }
    }

    const aggregate = HoursLog.aggregate([
        { $match: mainQuery },
        {
            $lookup:
            {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        {
            $addFields: {
                name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                course: { $concatArrays: ['$classes', '$events'] }
            }
        },

        { $unwind: '$course' },
        {
            $group: {
                _id: null,
                course: { $addToSet: { course: '$course.name', comment: '$course.comment', name: '$name' } },
                comment: { $addToSet: { course: 'General Comments', comment: '$comments', name: '$name' } }

            }
        },
        {
            $project: {
                comment: { $concatArrays: ['$course', '$comment'] }
            }
        },
        { $unwind: '$comment' },
        { $match: { $and: [{ 'comment.comment': { $ne: null } }, { 'comment.comment': { $ne: '' } }] } },
        {
            $group: {
                _id: '$comment.course',
                comments: { $addToSet: '$comment' },
                total: { $sum: 1 }
            }
        },
        {
            $facet: {
                comments: [
                    {
                        $project: {
                            _id: 1,
                            comments: 1,
                            total: 1

                        }
                    },
                    { $sort: { _id: 1 } },
                    { $skip: skip },
                    { $limit: limit },
                ],
                total: [
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 }
                        }
                    }
                ]
            }
        }


    ]);
    return aggregate.exec()
        .then(function (result) {
            const output = result[0]
            return res.json({ docs: output.comments, page, limit, total: output.total[0].count });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Hours Logs', 'Error fetching logs.'));
        });

});

router.post('/comments-by-class', adminGuard, async (req, res) => {

    if (!req.body.classId || !req.body.type) {
        return res.status(400).send(new ApiError('Comments', 'Unknown class.'));

    }

    var query = {};
    if (req.body.type == 'event') {
        query = { 'combined.event': mongoose.Types.ObjectId(req.body.classId) };
    } else {
        query = { 'combined.class': mongoose.Types.ObjectId(req.body.classId) };
    }


    const aggregate = HoursLog.aggregate([
        {
            $addFields: {
                combined: { $concatArrays: ['$classes', '$events'] }
            }
        },
        { $unwind: '$combined' },
        { $match: query },
        { $match: { $and: [{ 'combined.comment': { $ne: null } }, { 'combined.comment': { $ne: '' } }] } },
        {
            $lookup:
            {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },

        {
            $group: {
                _id: '$combined.name',
                comments: {
                    $addToSet: { comment: '$combined.comment', user: { $concat: ['$user.firstName', ' ', '$user.lastName'] } },

                },
                total: { $sum: 1 }
            }
        }
    ]);
    return aggregate.exec()
        .then(function (result) {
            return res.json(result[0]);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Hours Logs', 'Error fetching logs.'));
        });

});

router.get('/general-comments', adminGuard, async (req, res) => {
    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    var query = { $and: [{ comments: { $ne: null } }, { comments: { $ne: "" } }] };
    try {
        if(req.query.conf){
            query.conference = mongoose.Types.ObjectId(req.query.conf);
        }else{
            let conferece = await Redis.getCurrentConference();
            query.conference = mongoose.Types.ObjectId(conference);
        }
    } catch (e) {
        console.error(e);
    }
    return HoursLog.paginate(query, {
        page: page, limit: limit,
        populate: [{ path: 'user', select: 'firstName lastName' }],
        select: 'user comments'
    })
        .then(function (logs) {
            return res.json(logs);
        })
        .catch(function () {
            return res.status(500).send(new ApiError('Comments', 'Error fetching comments.'));

        })
});



module.exports = router;