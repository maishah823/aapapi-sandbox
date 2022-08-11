var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var moment = require('moment');
var ApiError = require('../../classes/ApiError');


router.get('/certs',(req,res)=>{
    User.find({certNumber:{$ne:null}, certExpiration:{$gte: moment().toDate()}})
    .select('firstName lastName fullname certYear certExpiration certNumber')
    .sort({lastName:1})
    .then(function(users){
        res.json(users);
    })
    .catch(function(err){
        console.error(err);
        return res.status(400).send(new ApiError('Certifications', 'There was an error retrieving the certifications.'));

    });


});

router.get('/version',(req,res)=>{
    const version = require('../../version_history')[0].version;
    res.json({version})
});

module.exports = router;