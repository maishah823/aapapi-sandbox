const User = require('../../models/user');
const Invoice = require('../../models/invoice');
const q = require('q');
const Quickbooks = require('../../services/quickbooks');
const moment = require('moment');
const fs = require('fs');
const Email = require('../../services/emailSvc');

module.exports = function (done) {
    console.log("SENDING DUES REMINDER");
    if (process.env.NODE_ENV == 'development') {
        duesReminderDev();

    } else {
        duesReminder();
    }
    done();
}

async function duesReminder() {

    try{
        let users = await User.find({
            $and:[
                {isMember:true},
                {memberLevel:{$ne:'life'}},
                {memberLevel:{$ne:'honorary'}},
                {memberLevel:{$ne:'retired'}},
                {memberLevel:{$ne:'life'}},
                {memberLevel:{$ne:null}}
            ]
        });
        await asyncForEach(users, async user => {
            await wait(500);
            let invoices = await Invoice.find({user:user._id, amount:{$gt:0}, paid:{$ne:true}, type:'Membership Dues'});
            await asyncForEach(invoices, async invoice => {
                Quickbooks.emailInvoice(invoice.invoiceRef);
                let message = `Our records show that you have an outstanding invoice for $${invoice.amount} for: ${invoice.memo}.
Please visit www.americanassociationofpolicepolygraphists.org/pay and enter your invoice number, ${invoice.invoiceNumber}, to remit payment.
`;
                Email.sendGeneralEmail([{email:user.email,name:user.fullname}], message, 'AAPP Outstanding Dues Reminder', 'AAPP Board of Directors')
            });

        });
        console.log("Done generating invoice reminders.");



    }catch(err){
        console.error(err);
    }
}

async function duesReminderDev() {
    
    try{
        let users = await User.find({
            $and:[
                {isMember:true},
                {memberLevel:{$ne:'life'}},
                {memberLevel:{$ne:'honorary'}},
                {memberLevel:{$ne:'retired'}},
                {memberLevel:{$ne:'life'}},
                {memberLevel:{$ne:null}}
            ]
        });
        await asyncForEach(users, async user => {
            await wait(500);
            console.log(user.fullname+":");
            let invoices = await Invoice.find({user:user._id, amount:{$gt:0}, paid:{$ne:true},type:'Membership Dues'});
            await asyncForEach(invoices, async invoice => {
                console.log(invoice);
                let message = `Our records show that you have an outstanding invoice for $${invoice.amount} for: ${invoice.memo}.
Please visit www.americanassociationofpolicepolygraphists.org/pay and enter your invoice number, ${invoice.invoiceNumber}, to remit payment.`
                console.log(message);
            });

        });
        console.log("Done generating invoice reminders.");



    }catch(err){
        console.error(err);
    }
}



function wait(time) {
    var deferred = q.defer();
    setTimeout(() => { deferred.resolve() }, time);
    return deferred.promise;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {

        await callback(array[index], index, array)
    }
}