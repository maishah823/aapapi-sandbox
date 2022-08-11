const User = require('../../models/user');
const q = require('q');
const Email = require('../../services/emailSvc');

module.exports = function (done) {
    console.log("SENDING CHECKOUT REMINDER");
    if (process.env.NODE_ENV == 'development') {
        checkoutReminderDev();

    } else {
        checkoutReminder();
    }
    done();
}

async function checkoutReminder() {

    try {
        let users = await User.find({
            $and: [
                { isAttendee: true },
                { checkedOut: { $ne: true } }
            ]
        });

        const message = "The deadline for submitting your bluesheet is June 10, 2019 (not July 10).\n\nPlease log on, click on checkout/bluesheet in the menu, and record your hours. You will not be able to generate your bluesheet or certificate after the deadline.";
        const emails = users.map(user => {
            return { email: user.email, name: user.fullname }
        });
        if (emails.length < 1) {
            throw new Error("No users found");
        }
        emails.push({name:'Developer',email:'gregharkins@harcomtech.com'});
        Email.sendGeneralEmail(emails, message, 'CORRECTION: AAPP Conference - URGENT', 'Board of Directors')
            .then(function () {
                console.log('Email sent.');
            });



    } catch (err) {
        console.error(err);
    }
}

async function checkoutReminderDev() {

    try {
        let users = await User.find({
            $and: [
                { isAttendee: true },
                { checkedOut: { $ne: true } }
            ]
        });

        const emails = users.map(user => {
            return { email: user.email, name: user.fullname }
        });
        if (emails.length < 1) {
            throw new Error("No users found");
        }
        console.log('CHECKOUT REMINDERS', JSON.stringify(emails));



    } catch (err) {
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