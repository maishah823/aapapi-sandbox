var ChatGroup = require('../../models/chatgroup');
var User = require('../../models/user');
var Redis = require('../../services/redisSvc');
var q = require('q');

module.exports = function (done) {
    q.all([ChatGroup.find({active:true}),User.find({active:true,isAttendee:true})])
    .then(function(result){

        var meta = {groups:{},users:{}};

        result[0].forEach(group=>{
            meta.groups[group.tag] = group.name;
        });
        result[1].forEach(user=>{
            meta.users[user._id] = user.fullname;
        });
        Redis.client.set('chatmeta',JSON.stringify(meta));
        Redis.publish('conf','meta',meta);
        done();
    })
    .catch(function(err){
        console.error(err);
    });

}