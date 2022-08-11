const User = require('../../models/user');
const Email = require('../../services/emailSvc');

module.exports = function(done){
    User.find({legacy:true,address:{$exists:false},active:true})
    .then(function(users){
        let emailObjects = users.map(u=>{
            return {email:u.email,name:u.fullname};
        });
        //Get a copy of this.
        emailObjects.push({email:'gregharkins@harcomtech.com',name:'Developer'});

        Email.memberReminder(emailObjects)
        .then(function(){
            console.log("Update Reminders Sent.");
        });
    })
    .catch(function(err){
        console.error(err);
    });
    done();
}