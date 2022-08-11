var express = require('express');
var router = express.Router();
var validator = require('validator');
var ApiError = require('../../classes/ApiError');
var jwt = require('jsonwebtoken');
var User = require('../../models/user');
var Event = require('../../models/extraEvent');
var Conference = require('../../models/conference');
var Coupon = require('../../models/coupon');
var q = require('q');
var Processor = require('../../services/confProcessor');
var Redis = require('../../services/redisSvc');


router.get('/events', (req, res) => {

    return Conference.findOne().sort({ startDateTime: -1 })
        .then(function (conf) {
            return Event.find({ conference: conf, cost:{$gt:0} }).select('name displayDate displayStartTime startDateTime endDateTime timezone description cost')
                .then(function (events) {

                    return res.json({ events: events, conference: conf });
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('Attend Conference', 'Error retrieving events.'));
                });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Conference', 'Error identifying upcoming conference.'));
        });

});

router.get('/conference', (req, res) => {
    return Conference.findOne().sort({ startDateTime: -1 })
        .then(function (conf) {
            return res.json(conf);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Attend Conference', 'Error retrieving conference info.'));
        });

});

router.post('/check-email', (req, res) => {
    if (!req.body.email) {
        return res.json({});
    }
    if (typeof req.body.email != 'string') {
        return res.json({})
    }
    var emailInput = req.body.email.toLowerCase().trim();

    if (!validator.isEmail(emailInput)) {
        return res.json({});
    }

    User.findOne({ email: emailInput })

        .then(function (user) {

            var returnObj = {};
            if (user) {
                returnObj.found = true;
                returnObj.email = emailInput;
                if (user.isAttendee) {
                    returnObj.isAttendee = true;
                }
                if (user.attendeePending) {
                    returnObj.attendeePending = true;
                }
                if(user.attendeeInfo){
                    returnObj.previouslyProcessed = true;
                }
                if (user.isMember) {
                    returnObj.isMember = true;
                }
            }

            return res.json(returnObj);
        })
        .catch(function (err) {
            console.err(err);
            return res.status(500).send(new ApiError('Attend Conference', 'Error validating email.'));
        });

});

router.post('/authenticate', (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send(new ApiError('Authenticate', 'Improper Credentials.'));
    }

    var emailInput = req.body.email.toLowerCase();

    if (!validator.isEmail(emailInput)) {
        return res.status(400).send(new ApiError('Authenticate', 'Malformed Email.'));
    }

    //find the user
    User.findOne({
        email: emailInput
    }, function (err, user) {
        if (err) {
            return res.status(500).send(new ApiError('Authenticate', 'Error processing request.'));
        }
        if (!user) {
            return res.status(400).send(new ApiError('Authenticate', 'Incorrect Credentials'));

        } else {

            if (!user.active) {
                return res.status(403).send(new ApiError('Authenticate', 'User not active.'));
            }

            if (user.isAttendee || user.attendeePending || user.attendeeInfo){
                return res.status(400).send(new ApiError('Authenticate', 'This email has either already registered or is not eligible.'));

            }

            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    var userObject = {
                        _id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        address: user.address
                    };
                    if (user.isMember) {
                        userObject.isMember = true;
                    }
                    if (user.isAttendee) {
                        userObject.isAttendee = true;
                    }
                    if (user.memberLevel == 'life') {
                        userObject.lifeMember = true;
                    }
                    var token = jwt.sign({ email: user.email }, process.env.JOIN_TOKEN_SECRET, { expiresIn: '10y' });
                    userObject.token = token;
                    res.json(userObject);
                } else {
                    return res.status(400).send(new ApiError('Authenticate', 'Incorrect Credentials'));
                }
            });

        }
    }).select("+password");
});

router.get('/coupons/active',(req,res)=>{
    Coupon.find({expiration:{$gte:new Date()}}).sort({created_at:-1})
    .then(function(coupons){
        return res.json(coupons);
    })
    .catch(function(err){
        console.error(err);
        return res.status(500).send(new ApiError('Coupons', 'Error retrieving coupons.'));
    })
});

router.post('/coupons/add',(req,res)=>{

    if(!req.body.coupon){
        return res.status(400).send(new ApiError('Coupons', 'Incomplete information.'));
    }

    let newCoupon = new Coupon(req.body.coupon);

    newCoupon.save()
    .then(function(){
        return res.json({complete:true});
    })
    .catch(function(err){
        console.error(err);
        return res.status(500).send(new ApiError('Coupons', 'Error adding coupon.'));
    })
});


router.post('/check-coupon', (req,res)=>{
    if(!req.body.type || !req.body.code){
        return res.status(400).send(new ApiError('Coupon', 'Error checking coupon.'));
    }
    return Coupon.findOne({code:req.body.code})
    .then(function(coupon){
        if(!coupon){
            return res.json({found:false});
        }
        if(coupon.type != req.body.type && coupon.type != 'member-rate'){
            return res.json({found:false});
        }
        if(coupon.singleUse && coupon.uses > 0){
            return res.status(500).send(new ApiError('Coupon', 'This SINGLE USE coupon has already been redeemed.'));
        }

        if(new Date() > coupon.expiration){
            return res.status(500).send(new ApiError('Coupon', 'This coupon is expired. Contact the National Office to obtain a current code.'));
        }

        return res.json({found:true, discount:coupon.discount, type:coupon.type, _id:coupon._id});
    })
    .catch(function (err) {
        console.err(err);
        return res.status(500).send(new ApiError('Coupon', 'Error checking coupon.'));
    });
});

router.post('/process',(req,res)=>{
    if(!req.body.type || !req.body.record){
        return res.status(400).send(new ApiError('Processor', 'Insufficient Information to Complete Transaction.'));
    }

    var mainEmail;
    if(req.body.record.emailGroup){
        mainEmail = req.body.record.emailGroup.email;
    }else{
        mainEmail = req.body.record.infoGroup.email;
    }
    return Processor(req.body.type,req.body.record)
    .then(function(result){
        Redis.publish('all','attendProgress',{type:'complete',email:mainEmail,message:'Process Complete.'});
        Redis.sendToWorker('confstats','all');
        return res.json(result);
    })
    
    .catch(function(err) {
        console.error(err);
        Redis.publish('all','attendProgress',{type:'error',email:mainEmail,message:'Process Incomplete'});
        if(typeof err == 'string'){
            return res.status(400).send(new ApiError('Processor', err));
        }
        return res.status(500).send(new ApiError('Processor', 'Error processing transaction.'));
    });

});



module.exports = router;