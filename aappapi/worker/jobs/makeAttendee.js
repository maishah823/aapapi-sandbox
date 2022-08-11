var User = require('../../models/user');
var Email = require('../jobs/email');
var generator = require('generate-password');
var Redis = require('../../services/redisSvc');

module.exports = function(payload,done){
    const password = generator.generate({
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
        strict: true
    });
    var needsPassword;
    User.findById(payload)
    .then(function(user){
        if(!user){
            done();
            return;
        }
        if(user.isAttendee){
            console.log("Approved user was already an attendee.")
            done();
            return;

        }
        if(user.needsCreds){
            user.password = password;
            needsPassword = true;
        }
        user.isAttendee = true;
        user.attendeePending = false;
        user.needsCreds = false;
            user.save()
            .then(function(saved){
                var payload = {email:saved.email,name:saved.fullname};
                if(needsPassword){
                    payload.needsPassword = true;
                    payload.password = password;
                }
                Email.newAttendee(payload,done);
            })
            .catch(function(err){
                console.error("ERROR MAKING ATTENDEE: ", err);
                done();
            });
       

       

        
    })
    .catch(function(err){
        console.error("ERROR MAKING ATTENDEE: ", err);
    });


}