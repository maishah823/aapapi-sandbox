var User = require('../../models/user');
var Email = require('../jobs/email');
var generator = require('generate-password');
var Redis = require('../../services/redisSvc');
var MembershipApplication = require('../../models/membershipApplication');

module.exports = function(payload,done){
    const password = generator.generate({
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
        strict: true
    });
    var needsPassword;
    User.findById(payload).populate('MembershipApplication')
    .then( async function(user){
        if(!user){
            done();
            return;
        }
        if(user.isMember){
            console.log("Approved user was already a member.")
            done();
            return;

        }

        let membershipApp = await GetMemberApplication(user._id);
        if(membershipApp){
            user.memberLevel = membershipApp.memberClass;
        }

        if(user.needsCreds){
            user.password = password;
            needsPassword = true;
        }
        user.isMember = true;
        user.needsCreds = false;

        Redis.lua.membernumber(0,function(err,result){
            if(err){
                console.error(err);
                done();
                return;
            }
            user.memberNumber = result;
            user.save()
            .then(function(saved){
                var payload = {email:saved.email,name:saved.fullname};
                if(needsPassword){
                    payload.password = password;
                }
                Email.newMember(payload,done);
                Redis.sendToWorker('notifySecretaryOfApproval',saved.fullname);
            })
            .catch(function(err){
                console.error("ERROR MAKING MEMBER: ", err);
                done();
            });
        });

       

        
    })
    .catch(function(err){
        console.error("ERROR MAKING MEMBER: ", err);
    });


}

function GetMemberApplication(userId){
    return MembershipApplication.findOne({user:userId})
    .catch(function(err){
        console.error(err);
        return null;
    });
}