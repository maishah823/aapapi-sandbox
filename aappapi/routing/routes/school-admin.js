var express = require('express');
var router = express.Router();
var Redis = require('../../services/redisSvc');
var ApiError = require('../../classes/ApiError');
var School = require('../../models/school');
var User = require('../../models/user');
var StudentDiscount = require('../../models/studentdiscount');
var adminGuard = require('../../guards/admin.guard');
var educatorGuard = require('../../guards/educator.guard');
var moment = require('moment');
var generator = require('generate-password');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


//FOR EDUCATORS
router.get('/students', educatorGuard, (req, res) => {
    const search = req.query.search || null;
    var query = {};
    if (search) {
        query = {
            $or: [
                { "lastName": { $regex: new RegExp(search), $options: 'i' } },
                { "firstName": { $regex: new RegExp(search), $options: 'i' } },
                { "email": { $regex: new RegExp(search), $options: 'i' } }
            ]
        };
    }
    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const skip = (page - 1) * limit;

    const cutOff = moment().subtract(1, 'year').toDate();

    const match = { school: ObjectId(req.decoded.adminForSchool) };

    const aggregate = StudentDiscount.aggregate([
        { $match: match },
        {
            $addFields: {
                numOfActive: { $cond: [{ $and: [{ $gt: ["$graduationDate", cutOff] }, { $not: ["$redeemed"] }] }, 1, 0] },
                numOfRedeemed: { $cond: ["$redeemed", 1, 0] },
                numOfExpired: { $cond: [{ $and: [{ $lt: ["$graduationDate", cutOff] }, { $not: ["$redeemed"] }] }, 1, 0] },
                isExpired: { $cond: [{ $and: [{ $lt: ["$graduationDate", cutOff] }, { $not: ["$redeemed"] }] }, true, false] }
            }
        },
        {
            $facet: {
                stats: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            active: { $sum: '$numOfActive' },
                            expired: { $sum: '$numOfExpired' },
                            redeemed: { $sum: '$numOfRedeemed' }
                        }
                    },
                    { $project: { _id: 0 } },
                    {
                        $addFields: {
                            percentage: { $divide: ["$redeemed", "$total"] }
                        }
                    }
                ],
                students: [
                    { $match: query },
                    {
                        $project: {
                            name: { $concat: ['$lastName', ', ', '$firstName'] },
                            email: 1,
                            graduationDate: 1,
                            redeemed: 1,
                            isExpired: 1
                        }
                    },
                    { $sort: { "name": 1 } },
                    { $skip: skip },
                    { $limit: limit }

                ],
                total: [
                    { $match: query },
                    { $count: 'count' }
                ]
            }
        },
        {
            $project: {
                total: { $arrayElemAt: ['$total', 0] },
                stats: { $arrayElemAt: ['$stats', 0] },
                students: 1
            }
        },
        {
            $project: {
                total: '$total.count',
                stats: 1,
                students: 1
            }
        },


    ]);

    aggregate.exec()
        .then(function (items) {
            res.json(items[0] || {});
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Schools', 'Could not retrieve students.'));
        });
});

router.post('/add-student-admin', (req, res) => {
    if (!req.decoded.isAdmin && !req.decoded.isEducator) {
        res.status(403).send(new ApiError('Permissions', 'Unauthorized'));
        var msg = `${req.decoded.name || 'An unknown user'} tried to add a student without authorization.`;
        Redis.writeToLog('Security', msg);
        return;
    }
    if (!req.body.student) {
        return res.status(400).send(new ApiError('Schools', 'Not enough information to add student.'));
    }
    var student = new StudentDiscount(req.body.student);
    student.created_by = req.decoded._id;
    student.save()
        .then(function (student) {
            res.json(student);
            Redis.sendToWorker('emailNewStudent', student._id);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Schools', 'Could not save new student'));
        });
});

router.post('/add-student-educator', educatorGuard, (req, res) => {
    if (!req.body.student) {
        return res.status(400).send(new ApiError('Schools', 'Not enough information to add student.'));
    }
    var student = new StudentDiscount(req.body.student);
    student.created_by = req.decoded._id;
    student.school = req.decoded.adminForSchool;

    student.save()
        .then(function (student) {
            res.json(student);
            Redis.sendToWorker('emailNewStudent', student._id);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Schools', 'Could not save new student'));
        });
});

router.post('/update-student/:id', (req, res) => {
    if (!req.decoded.isAdmin && !req.decoded.isEducator) {
        res.status(403).send(new ApiError('Permissions', 'Unauthorized'));
        var msg = `${req.decoded.name || 'An unknown user'} tried to change students records without authorization.`;
        Redis.writeToLog('Security', msg);
        return;
    }
    if (!req.body.fieldname || !req.body.value) {
        return res.status(400).send(new ApiError('Student Update', 'Improper Request'));
    }
    if (!req.params.id) {
        return res.status(400).send(new ApiError('Student Update', 'Improper Request'));
    }
    StudentDiscount.findByIdAndUpdate(req.params.id, { [req.body.fieldname]: req.body.value }, { runValidators: true })
        .then(function (student) {
            var toValue = req.body.value;
            var fromValue = student[req.body.fieldname];
            if (req.body.fieldname == 'graduationDate') {
                toValue = moment(req.body.value).format('MM/DD/YYYY');
                fromValue = moment(student[req.body.fieldname]).format('MM/DD/YYYY');
            }
            res.json({ _id: student._id });
            Redis.writeToLog('School', `${req.decoded.name} made a change to student ${student.firstName} ${student.lastName}. The field *${req.body.fieldname}* was changed from *${fromValue}* to *${toValue}*.`);
            if (req.body.fieldname == 'email') {
                Redis.sendToWorker('emailNewStudent', {
                    lastName: student.lastName,
                    firstName: student.firstName,
                    graduationDate: student.graduationDate,
                    email: req.body.value
                });
            }
        })
        .catch(function (err) {
            if (err.code == 11000) {
                res.status(400).send(new ApiError('Update Student', 'DUPLICATE. There is already a student registered with that email address.'));
            }
            console.error(err);
            return res.status(500).send(new ApiError('Student Update', 'Could not update student.'));
        });
});

//______________________________________________________________
//Routes following require admin permissions.
router.use(adminGuard);

router.get('/stats', (req, res) => {

    const search = req.query.search || null;
    var query = {};
    if (search) {
        query = { "name": { $regex: new RegExp(search), $options: 'i' } };
    }
    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const skip = (page - 1) * limit;

    const cutOff = moment().subtract(1, 'year').toDate();

    const aggregate = StudentDiscount.aggregate([
        {
            $project: {
                school: 1,
                activeVal: {
                    $cond: [{ $and: [{ $gt: ["$graduationDate", cutOff] }, { $not: ["$redeemed"] }] }, 1, 0]
                },
                expiredVal: {
                    $cond: [{ $and: [{ $lt: ["$graduationDate", cutOff] }, { $not: ["$redeemed"] }] }, 1, 0]
                },
                redeemedVal: {
                    $cond: ["$redeemed", 1, 0]
                }
            }
        },
        {
            $group: {
                _id: "$school",
                active: {
                    $sum: "$activeVal"
                },
                expired: {
                    $sum: "$expiredVal"
                },
                redeemed: {
                    $sum: "$redeemedVal"
                },
                total: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "schools",
                localField: "_id",
                foreignField: "_id",
                as: "affiliate"
            }
        },
        { $unwind: '$affiliate' },
        {
            $project: {
                _id: 0,
                active: 1,
                expired: 1,
                redeemed: 1,
                total: 1,
                percentage: { $divide: ["$redeemed", "$total"] },
                name: "$affiliate.name"
            }
        },
        { $match: query },
        { $sort: { "percentage": -1 } },
        {
            $facet: {
                meta: [{ $count: "total" }],
                data: [{ $skip: skip },
                { $limit: limit }]
            }
        },
        { $unwind: "$meta" }



    ])
    aggregate.exec()
        .then(function (stats) {
            res.json(stats[0] || {});
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('School Admin', 'Could not compile stats'));
        });

});

router.get('/schools', (req, res) => {
    var limit = parseInt(req.query.limit || 10);
    var page = parseInt(req.query.page || 1);

    query = {};
    if (req.query.search) {
        query.name = { $regex: new RegExp(req.query.search), $options: 'i' }
    }

    return School.paginate(query, { limit: limit, page: page, sort: { name: 1 }, populate: [{ path: 'educators', select: 'firstName lastName fullname email' }] })
        .then(function (schools) {
            return res.json(schools);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('School Admin', 'Could not retrieve list of schools.'));
        });
});

router.post('/schools', (req, res) => {

    if (!req.body.school) {
        return res.status(400).send(new ApiError('School Admin', 'Improper request when adding school.'));
    }

    var newSchool = new School({ ...req.body.school, created_by: req.decoded._id });
    newSchool.save()
        .then(function (school) {
            res.json(school);
            Redis.sendToWorker('writeLog', `${req.decoded.name} added school: ${school.name}`);
            return;
        })
        .catch(function (err) {
            if (err.code == 11000) {
                return res.status(400).send(new ApiError('School Admin', 'This school is already added.'));
            }
            console.error(err);
            return res.status(500).send(new ApiError('School Admin', 'Could not add school.'));
        });
});

router.get('/administrators', (req, res) => {
    var limit = parseInt(req.query.limit || 10);
    var page = parseInt(req.query.page || 1);
    return User.paginate({ $and: [{ isEducator: true }, { adminForSchool: { $ne: null } }] }, { limit: limit, page: page, sort: { lastName: 1 }, select: 'firstName lastName fullname email adminForSchool', populate: [{ path: 'adminForSchool', select: 'name address' }] })
        .then(function (users) {
            return res.json(users);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('School Admin', 'Could not retrieve list of school administrators.'));
        });
});

router.post('/add-school-admin', (req, res) => {
    if (!req.body.admin) {
        return res.status(400).send(new ApiError('School Admin', 'Insufficient Information'));
    }
    var admin = req.body.admin;
    if (!admin.firstName || !admin.lastName || !admin.email || !admin.adminForSchool) {
        return res.status(400).send(new ApiError('School Admin', 'Insufficient Information'));
    }

    const password = generator.generate({
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
        strict: true
    });

    admin.password = password;
    admin.passwordIsTemp = true;
    admin.isEducator = true;

    var newUser = new User(admin);
    newUser.save()
        .then(function (user) {
            Redis.sendToWorker('emailNewSchoolAdmin', { email: user.email, name: user.fullname, password: password });
            Redis.writeToLog('School', `${req.decoded.name} has added a school administrator: ${user.firstName} ${user.lastName}`);
            return res.json(user);
        })
        .catch(function (err) {
            if(err.code == 11000){
                return res.status(400).send(new ApiError('School Admin', 'User already exists with this email. Go to user admin to enable school permission.'));
            }
            console.error(err);
            return res.status(500).send(new ApiError('School Admin', 'Could not create user.'));
        });
});

router.get('/admin-students', (req, res) => {
    var limit = parseInt(req.query.limit || 10);
    var page = parseInt(req.query.page || 1);

    query = {};
    if (req.query.school) {
        query.school = req.query.school;
    }

    return StudentDiscount.paginate(query, { limit: limit, page: page, sort: { lastName: 1 }, populate: [{ path: 'school', select: 'name' }] })
        .then(function (students) {
            return res.json(students);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('School Admin', 'Could not retrieve list of students.'));
        });
});


module.exports = router;