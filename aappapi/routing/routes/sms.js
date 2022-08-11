var express = require('express');
var router = express.Router();
var adminGuard = require('../../guards/admin.guard');
var ApiError = require('../../classes/ApiError');
var User = require('../../models/user');
var Redis = require('../../services/redisSvc');

router.use(adminGuard);

router.post('/bulk-attendees', async (req,res)=>{
 
    //TODO Validate numbers
    if(!req.body.message){
        return res.status(400).send(new ApiError('Messaging', 'Could not generate SMS - No message content.'));
    }
    var message = req.body.message + " -" + req.decoded.name + ' (AAPP AUTOMATED MESSAGE - DO NOT REPLY)';
    var attendees;
    try{
      attendees = await User.find({isAttendee:true,textAuth:true}).populate('attendeeInfo');
      if(!attendees){
        throw new Error("Error compiling attendees for SMS Message");
      }
    }catch(e){
      console.error(e);
      return res.status(400).send(new ApiError('Messaging', 'Error compiling attendees.'));
    }
     var destinations = attendees.map((attendee)=>{
       if(!attendee.address){
         return null;
       }
       if(attendee.address.country != "United States"){
         return null;
       }
       if(!attendee.attendeeInfo){
         return null;
       }
       if(!attendee.attendeeInfo.checkedIn){
         return null;
       }
      
       return attendee.address.cellPhone;
     }).filter(number=>{
       if(!number){
         return false;
       }
       return true;
     });

     Redis.sendToWorker('sendSMSMessages',{destinations,message});


     return res.json({});
    
});

router.post('/bulk-admins', async (req,res)=>{
 
  //TODO Validate numbers
  if(!req.body.message){
      return res.status(400).send(new ApiError('Messaging', 'Could not generate SMS - No message content.'));
  }
  var message = req.body.message + " -" + req.decoded.name + ' (AAPP AUTOMATED MESSAGE - DO NOT REPLY)';
  var users;
  try{
    users = await User.find({isAdmin:true,suspended:{$ne:true}});
    if(!users){
      throw new Error("Error compiling admins for SMS Message");
    }
  }catch(e){
    console.error(e);
    return res.status(400).send(new ApiError('Messaging', 'Error compiling admins.'));
  }
   var destinations = users.map((user)=>{
     if(!user.address){
       return null;
     }
     if(user.address.country != "United States"){
       return null;
     }
     return user.address.cellPhone;
   }).filter(number=>{
     if(!number){
       return false;
     }
     return true;
   });

   Redis.sendToWorker('sendSMSMessages',{destinations,message});


   return res.json({});
  
});


module.exports = router;