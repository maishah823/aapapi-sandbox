var express = require('express');
var router = express.Router();
var Conference = require('../../models/conference');
var ApiError = require('../../classes/ApiError');
var ClassroomEvent = require('../../models/classroomEvent');
var ExtraEvent = require('../../models/extraEvent');
var Representative = require('../../models/representative');
var User = require('../../models/user');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
var moment = require('moment-timezone');
const Redis = require('../../services/redisSvc');
const q = require('q');
const pdfSvc = require('../../services/pdfSvc');
const Attendee = require('../../models/attendeeInfo');


router.get('/next', (req, res) => {
    return Conference.findOne().sort({ startDateTime: -1 })
        .then(function (conf) {
            return res.json(conf);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
        });
});

router.get('/classroom-events', (req, res) => {

    return Conference.findOne().sort({ startDateTime: -1 })
        .then(function (conf) {
            if (!conf) {
                return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
            }
            const match = { conference: ObjectId(conf._id), trashed: { $ne: true } };

            const aggregate = ClassroomEvent.aggregate([
                { $match: match },
                {
                    $lookup:
                    {
                        from: 'users',
                        localField: 'instructors',
                        foreignField: '_id',
                        as: 'instructors'
                    }
                },
                {
                    $lookup:
                    {
                        from: 'topics',
                        localField: 'topics',
                        foreignField: '_id',
                        as: 'topics'
                    }
                },
                {
                    $project: {
                        displayDate: 1,
                        displayStartTime: 1,
                        displayEndTime: 1,
                        startDateTime: 1,
                        endDateTime: 1,
                        sortDate: 1,
                        name: 1,
                        room: 1,
                        description: 1,
                        instructors: {
                            $map: {
                                input: '$instructors',
                                as: 'instructor',
                                in: { name: { $concat: ['$$instructor.firstName', ' ', '$$instructor.lastName'] }, _id: '$$instructor._id' }
                            }
                        },
                        topics: {
                            $map: {
                                input: '$topics',
                                as: 'topic',
                                in: { name: '$$topic.name', _id: '$$topic._id' }
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: { displayDate: '$displayDate', sortDate: '$sortDate' },
                        events: { $addToSet: '$$ROOT' },
                        dayTotal: { $sum: 1 }
                    }
                },
                { $sort: { '_id.sortDate': 1 } },

            ]);

            return aggregate.exec()
                .then(function (items) {
                    return res.json(items);
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('Conference', 'Error fetching schedule.'));
                });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
        });



});

router.get('/combined-events', (req, res) => {

    return Conference.findOne().sort({ startDateTime: -1 })
        .then(function (conf) {
            if (!conf) {
                return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
            }
            const query = { conference: ObjectId(conf._id), trashed: { $ne: true } };
            const aggregate = Conference.aggregate(
                [
                    { $limit: 1 },
                    { $project: { _id: '$$REMOVE' } },
                    { $lookup: { from: 'classroomevents', pipeline: [{ $match: query},{$addFields:{isClass: {$literal:true}}}], as: 'classroomevents'}},
                    { $lookup: { from: 'extraevents', pipeline: [{ $match: query }], as: 'extraevents' } },
                    { $project: { events: { $concatArrays: ["$classroomevents", "$extraevents"]}}},
                    { $unwind: '$events' },
                    { $replaceRoot: { newRoot: '$events' } },
                    {
                        $lookup:
                        {
                            from: 'users',
                            localField: 'instructors',
                            foreignField: '_id',
                            as: 'instructors'
                        }
                    },
                    {
                        $lookup:
                        {
                            from: 'topics',
                            localField: 'topics',
                            foreignField: '_id',
                            as: 'topics'
                        }
                    },
                    {
                        $project: {
                            displayDate: 1,
                            displayStartTime: 1,
                            displayEndTime: 1,
                            startDateTime: 1,
                            endDateTime: 1,
                            sortDate: 1,
                            name: 1,
                            room: 1,
                            description: 1,
                            isClass:1,
                            instructors: {
                                $map: {
                                    input: '$instructors',
                                    as: 'instructor',
                                    in: { name: { $concat: ['$$instructor.firstName', ' ', '$$instructor.lastName'] }, _id: '$$instructor._id' }
                                }
                            },
                            topics: {
                                $map: {
                                    input: '$topics',
                                    as: 'topic',
                                    in: { name: '$$topic.name', _id: '$$topic._id' }
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: { displayDate: '$displayDate', sortDate: '$sortDate' },
                            events: { $addToSet: '$$ROOT' },
                            dayTotal: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.sortDate': 1 } },
                ]);

            // const aggregate = ClassroomEvent.aggregate([
            //     { $match: match },
            //     {
            //         $lookup:
            //         {
            //             from: 'users',
            //             localField: 'instructors',
            //             foreignField: '_id',
            //             as: 'instructors'
            //         }
            //     },
            //     {
            //         $lookup:
            //         {
            //             from: 'topics',
            //             localField: 'topics',
            //             foreignField: '_id',
            //             as: 'topics'
            //         }
            //     },
            //     {
            //         $project: {
            //             displayDate: 1,
            //             displayStartTime: 1,
            //             displayEndTime: 1,
            //             startDateTime: 1,
            //             endDateTime: 1,
            //             sortDate: 1,
            //             name: 1,
            //             room: 1,
            //             description: 1,
            //             isClass: {$literal:true},
            //             instructors: {
            //                 $map: {
            //                     input: '$instructors',
            //                     as: 'instructor',
            //                     in: { name: { $concat: ['$$instructor.firstName', ' ', '$$instructor.lastName'] }, _id: '$$instructor._id' }
            //                 }
            //             },
            //             topics: {
            //                 $map: {
            //                     input: '$topics',
            //                     as: 'topic',
            //                     in: { name: '$$topic.name', _id: '$$topic._id' }
            //                 }
            //             }
            //         }
            //     },
            //     {
            //         $group: {
            //             _id: { displayDate: '$displayDate', sortDate: '$sortDate' },
            //             events: { $addToSet: '$$ROOT' },
            //             dayTotal: { $sum: 1 }
            //         }
            //     },
            //     {
            //         $lookup:
            //         {
            //             from: 'extraevents',
            //             localField: '_id.sortDate',
            //             foreignField: 'sortDate',
            //             as: 'extraevents'
            //         }
            //     },
            //     {
            //         $project: {
            //             _id:1,
            //             events: {$concatArrays:['$events',{
            //                 "$filter": {
            //                     "input": "$extraevents",
            //                     "as": "extraevent",
            //                     "cond": { "$ne": [ "$$extraevent.trashed", true ] }
            //                 }}]},
            //             classTotal: '$dayTotal'
            //         }
            //     },
            //     { $sort: { '_id.sortDate': 1 } },

            // ]);



            return aggregate.exec()
                .then(function (items) {
                    console.log(items)
                    return res.json(items);
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('Conference', 'Error fetching schedule.'));
                });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
        });



});

router.get('/classroom-events/edit/:id', (req, res) => {
    ClassroomEvent.findById(req.params.id)
        .populate('conference')
        .then(function (event) {
            return res.json(event);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Conference', 'Could not find event.'));
        });
});

router.get('/events', (req, res) => {

    return Conference.findOne().sort({ startDateTime: -1 })
        .then(function (conf) {
            if (!conf) {
                return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
            }
            const match = { conference: ObjectId(conf._id), trashed: { $ne: true } };

            const aggregate = ExtraEvent.aggregate([
                { $match: match },
                {
                    $project: {
                        displayDate: 1,
                        displayStartTime: 1,
                        displayEndTime: 1,
                        startDateTime: 1,
                        endDateTime: 1,
                        sortDate: 1,
                        name: 1,
                        cost: 1,
                        room: 1,
                        description: 1
                    }
                },
                {
                    $group: {
                        _id: { displayDate: '$displayDate', sortDate: '$sortDate' },
                        events: { $addToSet: '$$ROOT' },
                        dayTotal: { $sum: 1 }
                    }
                },
                { $sort: { '_id.sortDate': 1 } },

            ]);

            return aggregate.exec()
                .then(function (items) {
                    return res.json(items);
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('Conference', 'Error fetching schedule.'));
                });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
        });



});

router.get('/events/edit/:id', (req, res) => {
    ExtraEvent.findById(req.params.id)
        .populate('conference')
        .then(function (event) {
            return res.json(event);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Conference', 'Could not find event.'));
        });
});


router.get('/advert', (req, res) => {

    return Conference.findOne().sort({ startDateTime: -1 })
        .then(function (conf) {
            if (!conf) {
                return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
            }
            var conferenceData = conf;
            var trackInstructors = [];
            var returnInstructors = [];
            var titles = new Set();

            return ClassroomEvent.find({ conference: conf._id, trashed:{$ne:true} })
                .populate([
                    { path: 'instructors', select: 'firstName lastName fullname instructorInfo', populate: [{ path: 'instructorInfo', select: 'picture title' }] }
                ])
                .then(function (events) {
                    events.forEach((event) => {
                        if (event.instructors && event.instructors.length > 0) {
                            titles.add(event.name);
                        }
                        event.instructors.forEach((instructor) => {

                            if (trackInstructors.indexOf(instructor._id) < 0) {
                                if (instructor.instructorInfo) {
                                    if (instructor.instructorInfo.picture && instructor.instructorInfo.title) {
                                        trackInstructors.push(instructor._id);
                                        returnInstructors.push(instructor);
                                    }
                                }
                            }
                        });
                    });
                    return ExtraEvent.find({ conference: conf._id,trashed:{$ne:true} }).select('name startDateTime endDateTime displayDate displayStartTime timezone').sort({ startDateTime: 1 })
                        .then(function (extraEvents) {

                            return res.json({ instructors: returnInstructors, titles: Array.from(titles), events: extraEvents, conference: conferenceData });
                        })
                        .catch(function (err) {
                            console.error(err);
                            return res.status(500).send(new ApiError('Conference', 'Error retreiving information.'));
                        });

                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('Conference', 'Error retreiving information.'));
                });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
        });


});

router.get('/classroom-detail/:id', (req, res) => {
    ClassroomEvent.findById(req.params.id)
        .populate([
            { path: 'topics' },
            { path: 'materials' },
            { path: 'instructors', select: 'firstName lastName fullname', populate: [{ path: 'instructorInfo' }] }
        ])
        .then(function (course) {
            res.json(course);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Schedule', 'Error retrieving class details.'));
        });
});

router.get('/vendors', (req, res) => {
    Redis.client.get('currentconf', (err, conf) => {

        if (err) {
            return res.status(400).send(new ApiError('Conference', 'Error fetching vendors.'));
        }
        const match = { conference: mongoose.Types.ObjectId(conf), finalApproved: true };

        const aggregate = Representative.aggregate([
            { $match: match },
            {
                $group: {
                    _id: 0,
                    vendor: { $addToSet: '$company' },
                }
            },
            { $unwind: '$vendor' },
            // {
            //     $group: {
            //         _id:'$vendors',
            //         total: { $sum: 1 }
            //     }
            // },
            { $sort: { '_id': 1 } },

        ]);

        return aggregate.exec()
            .then(function (items) {
                if (Array.isArray(items)) {
                    return res.json(items.map(v => v.vendor));
                } else {
                    return res.json([]);
                }
            })
            .catch(function (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Conference', 'Error fetching vendors.'));
            });
    });
});



router.get('/pdf/classroom',async (req,res)=>{
    const conference = await Conference.findOne().sort({ startDateTime: -1 })
    
    return ClassroomEvent.find({conference: conference._id, trashed:{$ne:true}}).populate('conference instructors').sort({startDateTime:1})
    .then(function(classes){
        return pdfSvc.schedule(res, classes, conference)
        .then(function(result){
            const msg = `PDF version of conference schedule was downloaded.`;
            console.log(msg);
            //Redis.writeToLog('Downloads', msg);
        });
    })
    .catch(function(err){
        console.error(err);
        return res.status(400).send(new ApiError('Schedule', 'Could not create PDF version of class schedule.'));
    });
});

router.get('/instructors',(req,res)=>{
    return Conference.findOne().sort({ startDateTime: -1 })
    .then(function (conf) {
        if (!conf) {
            return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
        }
        const match = { conference: ObjectId(conf._id), trashed: { $ne: true } };

        const aggregate = ClassroomEvent.aggregate([
            { $match: match },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'instructors',
                    foreignField: '_id',
                    as: 'instructors'
                }
            },
            {$unwind: '$instructors'},
            {
                $lookup:
                {
                    from: 'instructors',
                    localField: 'instructors.instructorInfo',
                    foreignField: '_id',
                    as: 'info'
                }
            },
            {$unwind: '$info'},
            {
                $project: {
                    className: '$name',
                    instructors: 1,
                    info:1
                    
                }
            },
            { $sort: { 'instructors.lastName': 1 } },
            {
                $group: {
                    _id: {id: '$instructors._id', name:{$concat:['$instructors.firstName',' ', '$instructors.lastName']},picture:'$info.picture', title:'$info.title', education:'$info.education',research:'$info.research',summary:'$info.summary'},
                    classes: { $addToSet: '$className' },
                    totalClasses: {$sum: 1}
                }
            },
            {
                $project: {
                    _id: '$id',
                    name:'$_id.name',
                    classes:1,
                    totalClasses:1,
                    picture:'$_id.picture',
                    title:'$_id.title',
                    education:'$_id.education',
                    research:'$_id.research',
                    summary:'$_id.summary'
                    
                }
            },
            

        ]);

        return aggregate.exec()
            .then(function (items) {
                return res.json(items);
            })
            .catch(function (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Conference', 'Error fetching instructors.'));
            });
    })
    .catch(function (err) {
        console.error(err);
        return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
    });
});




module.exports = router;