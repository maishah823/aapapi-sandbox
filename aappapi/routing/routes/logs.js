var express = require('express');
var router = express.Router();
var ChangeLog = require('../../models/changeLog');
var ApiError = require('../../classes/ApiError');
var adminGuard = require('../../guards/admin.guard');

router.get('/',adminGuard,(req,res)=>{
    var query = {};
    var limit = parseInt(req.query.limit || 10);
    var page = parseInt(req.query.page || 1);
    if(req.query.type){
        query.logType = req.query.type;
    }


    return ChangeLog.paginate(query,{page,limit,sort:{created_at:-1}})
    .then(function (logs) {
        return res.json(logs);
    })
    .catch(function (err) {
        console.error(err);
        return res.status(500).send(new ApiError('Logs', 'Could not retrieve logs.'));
    });

});

router.get('/categories',adminGuard,(req,res)=>{
    const aggregate = ChangeLog.aggregate([
        {$group: {_id: null, categories: {$addToSet: "$logType"}}}
    ]);
    return aggregate.exec()
    .then(function(result){
        var cats = [];
        if(result.length > 0){
            if(result[0].categories && result[0].categories.length > 0){
                cats = result[0].categories;
            }
        }
        return res.json(cats);
    })
    .catch(function(err){
        console.error(err);
            return res.status(500).send(new ApiError('Logs', 'Could not retrieve log categories.'));
    });


});


module.exports = router;