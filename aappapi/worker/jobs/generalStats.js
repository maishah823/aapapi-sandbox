var Redis = require('../../services/redisSvc');
var User = require('../../models/user');
var mongoose = require('mongoose');
var moment = require('moment');

module.exports = function (type, done) {

            switch (type) {
                case 'all':
                    all();
                    break;
                case 'memberUpdates':
                    memberUpdates();
                    break;
            }
            done();

}

function all() {
    memberUpdates();
}

function memberUpdates() {
    const aggregate = User.aggregate([
        { $match: { isMember:true }},
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                needsUpdate: {$sum:{$cond:[{$not:['$address']},1,0]}}
            }
        }


    ]);

    aggregate.exec()
        .then(function (result) {
           
            if (result && result[0]) {
                Redis.client.hmset('general-stats',
                {
                    'total-members': result[0].total,
                    'needs-update': result[0].needsUpdate,
                },
                    (err,redisresponse) => {
                       if(err){
                           console.error(err);
                       }else{
                        Redis.publish('admin','memberUpdatesChanged',true);
                       }
                    });
            } 
        })
        .catch(function (err) {
            console.error(err);

        });
}

