var User = require('../../models/user');
var Redis = require('../../services/redisSvc');
var moment = require('moment');

module.exports = function (done) {
    User.find({ active: true, isAttendee: true })
        .then(function (users) {
            users.forEach(user => {
                Redis.client.zadd('users', moment().add(1, 'minute').unix(), user._id.toString());
            });
            Redis.client.ZREMRANGEBYSCORE('online', 0, moment().unix(), function (err, numRemoved) {
                done();        
            });
        })
        .catch(function (err) {
            console.error(err);
        });



}