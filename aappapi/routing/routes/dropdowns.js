var express = require('express');
var router = express.Router();
var School = require('../../models/school');
var Topic = require('../../models/topic');
var Conf = require('../../models/conference');

router.get('/schools',(req,res)=>{
    return School.find().select('name address')
    .then(function(schools){
        return res.json(schools);
    })
    .catch(function(err){
        console.err(err);
        return res.status(500).send(new ApiError('Dropdown', 'Error loading schools.'));
    });
    
});

router.get('/topics',(req,res)=>{
    return Topic.find().select('name')
    .then(function(topics){
        return res.json(topics);
    })
    .catch(function(err){
        console.err(err);
        return res.status(500).send(new ApiError('Dropdown', 'Error loading topics.'));
    });
    
});

router.get('/conferences',(req,res)=>{
    
    return Conf.find().sort({ startDateTime: -1 })
    .then(function(conferences){
        return res.json(conferences.map(conference=>{return{_id:conference._id,name:`${conference.city}, ${conference.state}`}}));
    })
    .catch(function(err){
        console.err(err);
        return res.status(500).send(new ApiError('Dropdown', 'Error loading topics.'));
    });

    
});

module.exports = router;