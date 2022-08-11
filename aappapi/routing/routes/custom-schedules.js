const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const confGuard = require('../../guards/conf.guard');
const ApiError = require('../../classes/ApiError');
const Validators = require('../../validators');
const CustomSchedule = require('../../models/customSchedule');
const Redis = require('../../services/redisSvc');
const Conference = require('../../models/conference');
const pdfSvc = require('../../services/pdfSvc');


router.use(confGuard);

router.get('/', async (req, res) => {

    //Get Conference.
    var confId;
    try {
        confId = await Redis.getCurrentConference();
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Custom Schedule', 'Could not determine the correct conference.'));
    }
    if (!confId) {
        return res.status(400).send(new ApiError('Custom Schedule', 'Could not determine the correct conference.'));
    }
    

    if (!confId) {
        return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
    }

    const match = { conf: ObjectId(confId), user: ObjectId(req.decoded._id)};
   
    const aggregate = CustomSchedule.aggregate([
        { $match: match },
        {
            $lookup:
            {
                from: 'classroomevents',
                localField: 'classes',
                foreignField: '_id',
                as: 'classes'
            }
        },
        {$unwind:'$classes'},
        {
            $replaceRoot: { newRoot: "$classes" }
        },
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
        { $sort: { '_id.sortDate': 1 } }

    ]);

    return aggregate.exec()
        .then(function (items) {
            
            return res.json(items);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Conference', 'Error fetching schedule.'));
        });





    // if (!Validators.isValidObjectId(req.query.id)) {
    //     return res.status(400).send(new ApiError('Custom Schedule', 'Could not locate user.'));
    // }
    // try{
    // const confId = await Redis.getCurrentConference();
    // }catch(e){
    //     console.error(e);
    //     return res.status(400).send(new ApiError('Custom Schedule', 'Could not determine the correct conference.'));
    // }

    // CustomSchedule.findOne({conf:confId, user:req.query.id})
    //     .then(function (items) {
    //         return res.json(items);
    //     })
    //     .catch(function (err) {
    //         console.error(err);
    //         return res.status(400).send(new ApiError('Custom Schedule', 'Could not retrieve custom schedule.'));
    //     });
});

router.post('/add', async (req, res) => {
    if (!Validators.isValidObjectId(req.body.classId)) {
        return res.status(400).send(new ApiError('Custom Schedule', 'Could not add class.'));
    }
    var confId;
    try {
        confId = await Redis.getCurrentConference();
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Custom Schedule', 'Could not determine the correct conference.'));
    }
    if (!confId) {
        return res.status(400).send(new ApiError('Custom Schedule', 'Could not determine the correct conference.'));
    }

    CustomSchedule.findOneAndUpdate({ conf: confId, user: req.decoded._id }, { conf: confId, user: req.decoded._id, $addToSet: { classes: req.body.classId } }, { upsert: true })
        .then(function () {
            return res.json({});
        })
        .catch(function (err) {
            console.error(err);
            return res.status(400).send(new ApiError('Custom Schedule', 'Error saving custom schedule.'));
        });
});
router.post('/remove', async (req, res) => {
    if (!Validators.isValidObjectId(req.body.classId)) {
        return res.status(400).send(new ApiError('Custom Schedule', 'Could not remove class.'));
    }
    var confId;
    try {
        confId = await Redis.getCurrentConference();
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Custom Schedule', 'Could not determine the correct conference.'));
    }
    if (!confId) {
        return res.status(400).send(new ApiError('Custom Schedule', 'Could not determine the correct conference.'));
    }

    CustomSchedule.findOneAndUpdate({ conf: confId, user: req.decoded._id }, { conf: confId, user: req.decoded._id, $pull: { classes: req.body.classId } }, { upsert: true })
        .then(function () {
            return res.json({});
        })
        .catch(function (err) {
            console.error(err);
            return res.status(400).send(new ApiError('Custom Schedule', 'Error updating custom schedule.'));
        });
});


router.get('/pdf',async (req,res)=>{
     //Get Conference.
     var confId;
     try {
         confId = await Redis.getCurrentConference();
     } catch (e) {
         console.error(e);
         return res.status(400).send(new ApiError('Custom Schedule', 'Could not determine the correct conference.'));
     }
     if (!confId) {
         return res.status(400).send(new ApiError('Custom Schedule', 'Could not determine the correct conference.'));
     }
     
 
     if (!confId) {
         return res.status(400).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
     }
     
     const match = { conf: confId, user: req.decoded._id};
     return CustomSchedule.findOne(match).populate('classes instructors').sort({'classes.startDateTime':1})
     .then( async function(schedule){
         
         if(schedule.classes.length > 0){
             try{
            const conference = await Conference.findById(confId);
            return pdfSvc.schedule(res, schedule.classes.sort(sortClasses), conference, req.decoded.name)
            .then(function(result){
                const msg = `Custom schedule was downloaded by ${req.decoded.name}`;
                console.log(msg);
                Redis.writeToLog('Downloads', msg);
            });
            }catch(e){
                console.error(e);
                return res.status(400).send(new ApiError('Custom Schedule', 'There was an error building your PDF.'));

            }
         }else{
            return res.status(400).send(new ApiError('Custom Schedule', 'Could not find your custom schedule.'));

         }
     })
     .catch(function(err){
         console.error(err);
        return res.status(400).send(new ApiError('Custom Schedule', 'Could not find your custom schedule.'));
     })
});

function sortClasses(a, b) {
    if (a.startDateTime < b.startDateTime) {
      return -1;
    }
    if (a.startDateTime > b.startDateTime) {
      return 1;
    }
   
    return 0;
  }


module.exports = router;