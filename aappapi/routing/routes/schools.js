var express = require('express');
var router = express.Router();
var School = require('../../models/school');
var Redis = require('../../services/redisSvc');
var ApiError = require('../../classes/ApiError');

router.get('/',(req,res)=>{
    School.find().select('name address phone')
    .then(function(schools){
        return res.json(schools);
    })
    .catch(function(err){
        console.error(err);
            return res.status(500).send(new ApiError('School Listing', 'Could not retrieve school listing.'));
    });
});

router.get('/schools-by-state', (req,res)=>{
    const aggregated = School.aggregate([
        {$sort:{name:1}},
        {$project:{
            _id:1,
            street:"$address.street",
            city:"$address.city",
            state: "$address.state",
            zip: "$address.zip",
            country:"$address.country",
            phone:1,
            name:1,

        }},
        {$group:{
            _id:{state:'$state',country:'$country'},
            records:{$push:{name:"$name",street:"$street", city:"$city",state:"$state",zip:"$zip",phone:"$phone"}}
        }},
        {$sort:{'_id.state':1}}
    ]);

    return aggregated.exec()
    .then(function(schools){
        return res.json(schools);
    })
    .catch(function(err){
        console.error(err);
            return res.status(500).send(new ApiError('School Listing', 'Could not retrieve school listing.'));
    });
});






module.exports = router;