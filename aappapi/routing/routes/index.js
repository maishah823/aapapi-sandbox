var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var jwt = require('jsonwebtoken');
var validator = require('validator');
var logger = require('../../services/logger.js').get();
var Quickbooks = require('../../services/quickbooks');
var request = require('request');
var Redis = require('../../services/redisSvc');
var Guid = require('guid');
var moment = require('moment');
var ApiError = require('../../classes/ApiError');

router.get('/', function (req, res, next) {
    res.status(200).send("Harcom Technologies, LLC");
});


router.post('/authenticate', function (req, res, next) {

    if (!req.body.email || !req.body.password) {
        return res.status(400).send(new ApiError('Login', 'No credentials provided.'));
    }

    var emailInput = req.body.email.toLowerCase();

    if (!validator.isEmail(emailInput)) {
        return res.status(400).send(new ApiError('Login', 'Malformed Email.'));
    }

    //find the user
    User.findOne({
        email: emailInput
    }, function (err, user) {
        if (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Login', 'Error processing request.'));
        }
        if (!user) {
            return res.status(403).send(new ApiError('Login', 'Incorrect Credentials.'));

        } else {

            if (!user.active) {
                return res.status(403).send(new ApiError('Login', 'User not active.'));
            }

            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    var userObject = {
                        _id: user._id,
                        email: user.email,
                        memberLevel: user.memberLevel,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        fullname: user.fullname,
                        chatname: user.chatname,
                        groups: user.groups,
                        passwordIsTemp: user.passwordIsTemp,
                        region: user.region,
                        checkedOut: user.checkedOut
                    };

                    if(user.address){
                        if(user.address.street1 && user.address.city && user.address.state && user.address.zip){
                            userObject.hasAddress = true;
                        }
                    }

                    if(user.isInstructor){
                        if(user.instructorInfo){
                            if(user.instructorInfo.picture && user.instructorInfo.title){
                                userObject.hasInstructorInfo = true;
                            }
                        }
                    }

                    if(user.attendeePending){
                        userObject.attendeePending = true;
                    }

                    var tokenUser = {
                        _id: user._id,
                        email: user.email,
                        name: user.fullname,
                        groups: user.groups,
                        adminForSchool: user.adminForSchool,
                        school: user.school,
                        checkedOut: user.checkedOut

                    };

                    var tokenSocket = {
                        _id: user._id,
                        email: user.email,
                        name: user.chatName,
                        groups: user.groups,
                        checkedOut: user.checkedOut
                    };

                    if (user.isAdmin) {
                        tokenUser.isAdmin = true;
                        userObject.isAdmin = true;
                        tokenSocket.isAdmin = true;
                    }
                    if (user.isMember) {
                        tokenUser.isMember = true;
                        tokenSocket.isMember = true;
                        userObject.isMember = true;
                    }
                    if (user.isAttendee) {
                        tokenUser.isAttendee = true;
                        tokenSocket.isAttendee = true;
                        userObject.isAttendee = true;
                    }

                    if (user.isDeveloper) {
                        tokenUser.isDeveloper = true;
                        tokenSocket.isDeveloper = true;
                        userObject.isDeveloper = true;
                    }

                    if (user.isEducator) {
                        tokenUser.isEducator = true;
                        tokenSocket.isEducator = true;
                        userObject.isEducator = true;
                    }

                    if (user.isInstructor) {
                        tokenUser.isInstructor = true;
                        tokenSocket.isInstructor = true;
                        userObject.isInstructor = true;
                    }

                    var token = jwt.sign(tokenUser, process.env.TOKEN_SECRET, { expiresIn: '5m' });
                    var refresh = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
                    var socket = jwt.sign(tokenSocket, process.env.SOCKET_TOKEN_SECRET, { expiresIn: '7d' });

                    //Attach tokens
                    userObject.token = token;
                    userObject.refresh = refresh;
                    userObject.socket = socket;

                    res.json(userObject);
                } else {
                    return res.status(403).send(new ApiError('Login', 'Incorrect Credentials.'));
                }
            });

        }
    }).select("+password").populate([{path:'instructorInfo',select:'title picture'}]);

});

router.get('/request-quickbooks-token/:code', (req, res) => {
    if(req.params.code != process.env.QUICKBOOKS_AUTH_CODE){
        return res.status(403).send("NOT AUTHORIZED");
        
    }
    res.redirect(Quickbooks.getAuthURL());
});

router.get('/quickbooks-auth-callback', (req, res) => {
    if (req.query.state != process.env.QUICKBOOKS_STATE_SECRET) {
        res.status(403).send("UNAUTHORIZED REQUEST")
    }
    var auth = new Buffer.from(process.env.QUICKBOOKS_ID + ':' + process.env.QUICKBOOKS_SECRET).toString('base64');

    var postBody = {
        url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + auth,
        },
        form: {
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: process.env.BASE_URL + '/quickbooks-auth-callback'
        }
    };

    request.post(postBody, function (e, r, data) {
        var accessToken = JSON.parse(r.body);
        if(accessToken.access_token && accessToken.refresh_token){
            Redis.client.set('qb_access_token',accessToken.access_token);
            Redis.client.set('qb_refresh_token',accessToken.refresh_token);
            res.status(200).send("CONNECTED");
        }else{
            res.status(500).send("NOT CONNECTED");
        }
    });
    
});

router.post('/send-reset-email', (req,res)=>{
    if (!req.body.email) {
        return res.status(400).send(new ApiError('Reset', 'No email provided.'));
    }
    var emailInput = req.body.email.toLowerCase();

    if (!validator.isEmail(emailInput)) {
        return res.status(400).send(new ApiError('Reset', 'Malformed Email.'));
    }

    var theGuid = Guid.raw();

    User.findOneAndUpdate({email:emailInput},{resetCode:theGuid,resetExpire:moment().add(1,'day').toDate(),allowReset:true,needsCreds:false})
    .then(function(user) {

        if(!user){
            return res.status(400).send(new ApiError('Reset', 'Could not process password reset'));
        }
        //TODO: EMAIL LINK
        console.log(user.email, ' http://localhost:4200/web/public/reset/'+ theGuid);
        Redis.sendToWorker('emailPasswordResetLink', {email:user.email,link:'https://www.americanassociationofpolicepolygraphists.org/web/public/reset/'+theGuid});
        return res.json({complete:true});
    })
    .catch(function (err) {
        console.error(err);
        return res.status(500).send(new ApiError('Reset', 'Could not process password reset'));
    });

    


});

router.post('/reset-pass', (req,res)=>{
    if (!req.body.email) {
        return res.status(400).send(new ApiError('Reset', 'No email provided.'));
    }
    var emailInput = req.body.email.toLowerCase();

    if (!validator.isEmail(emailInput)) {
        return res.status(400).send(new ApiError('Reset', 'Malformed Email.'));
    }

    if (!req.body.code){
        return res.status(400).send(new ApiError('Reset', 'Not authorized.'));
    }

    User.findOne({email:emailInput})
    .then(function (user) {
        if(!user){
            return res.status(400).send(new ApiError('Reset', 'Unable to reset password for this user. Check your input or try requesting a new reset link by clicking FORGOT PASSWORD.'));
        }
        if( user.resetExpire < new Date()){
            return res.status(400).send(new ApiError('Reset', 'This link has expired. Please request new reset email.'));
        }
        if(user.resetCode != req.body.code || !user.allowReset){
            return res.status(400).send(new ApiError('Reset', 'Not authorized. Try requesting a new reset link by clicking FORGET PASSWORD'));
        }
                user.password = req.body.password;
                user.resetCode = null;
                user.resetExpire = new Date();
                user.allowReset = false;
                user.passwordIsTemp = false;
            
        return user.save()
        .then(function(){
            return res.json({complete:true});
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Reset', 'Could not process password reset. Contact National Office Manager. 2.'));
        });
    })
    .catch(function (err) {
        console.error(err);
        return res.status(500).send(new ApiError('Reset', 'Could not process password reset. Contact National Office Manager. 3.'));
    });

});


module.exports = router;
