var Attendee = require('../../models/attendeeInfo');
var Quickbooks = require('../../services/quickbooks');
module.exports = async function(payload,done){
    try{
        var attendeeInfo = await Attendee.findById(payload.attendeeInfo).populate('user invoiceRef');
    }catch(e){
        console.error(e);
        done();
        return;
    }

    //Check the rate the user paid.
    if(attendeeInfo.rate <= 320){
        console.log("Merge: Rate already at $320.");
        done();
        return;
    }
    var discount = attendeeInfo.rate - 320;

    //Refund the difference.
    try{
    await Quickbooks.refund(attendeeInfo.invoiceRef._id, discount,`${attendeeInfo.user.fullname} adjusted to member rate.`,'conference');
    }catch(e){
        console.error(e);
        done();
        return;
    }
    await Attendee.findByIdAndUpdate(payload.attendeeInfo, {rate:attendeeInfo.rate - discount});
    done();


}