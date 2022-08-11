const express = require('express');
const router = express.Router();
const ApiError = require('../../classes/ApiError');
const User = require('../../models/user');
const q = require('q');
const EmailSvc = require('../../services/emailSvc');
const adminGuard = require('../../guards/admin.guard');
const Invoice = require('../../models/invoice');

router.use(adminGuard);

router.post('/bulk', (req, res) => {

    const payload = req.body.payload;
    if (!payload.group || !payload.message) {
        return res.status(400).send(new ApiError("Email","Not enough Info to send email."));
    }


    var promise = q.promise(function (resolve, reject) {
        reject("Unknown Request.");
    });

    switch (payload.group) {
        case 'all':
            promise = EmailAllMembers(payload.message, req.decoded.name);
            break;
        case 'attendees':
            promise = EmailAttendees(payload.message, req.decoded.name);
            break;
        case 'instructors':
            promise = EmailInstructors(payload.message, req.decoded.name);
            break;
        case 'region1':
            promise = EmailRegion(1, payload.message, req.decoded.name);
            break;
        case 'region2':
            promise = EmailRegion(2, payload.message, req.decoded.name);
            break;
        case 'region3':
            promise = EmailRegion(3, payload.message, req.decoded.name);
            break;
        case 'region4':
            promise = EmailRegion(4, payload.message, req.decoded.name);
            break;
        case 'region5':
            promise = EmailRegion(5, payload.message, req.decoded.name);
            break;
        case 'state':
            if(!payload.state){
                return res.status(400).send(new ApiError("Email","State was not received"));
            }
            promise = EmailByState(payload.state, payload.message, req.decoded.name);
            break;
        case 'test':
            promise = Test(payload.message, req.decoded.name);
            break;
        case 'admin':
            promise = Admin(payload.message, req.decoded.name);
            break;
        case 'outstanding':
            promise = MembersWithOutstandingOrPaidInvoices(true,payload.message, req.decoded.name);
            break;
        case 'paid':
            promise = MembersWithOutstandingOrPaidInvoices(false,payload.message, req.decoded.name);
            break;


    }
    
    return promise
        .then(function () {
            return res.json({});
        })
        .catch(function (err) {
            console.error(err);
            return res.status(400).send(new ApiError("Email",err));
        });
});

function EmailByState(state, message, sender) {
    return User.find({ $and:[{active: true}, {'address.state': state}, {isMember:true}] })
        .then(function (users) {

            const emails = users.map(user => {
                return {email:user.email,name:user.fullname}
            });
            if (emails.length < 1){
                return q.reject('No Users Found');
            }
            EmailSvc.sendGeneralEmail(emails, message, 'AAPP Announcement', sender)
            .then(function(){
                console.log('Email sent.');
            });

        });

}

function EmailAttendees(message, sender) {
    return User.find({ $and:[{active: true}, {isAttendee: true}] })
        .then(function (users) {

            const emails = users.map(user => {
                return {email:user.email,name:user.fullname}
            });
            if (emails.length < 1){
                return q.reject('No Users Found');
            }
            EmailSvc.sendGeneralEmail(emails, message, 'AAPP Conference Announcement', sender)
            .then(function(){
                console.log('Email sent.');
            });

        });

}

function EmailInstructors(message, sender) {
    return User.find({ $and:[{active: true}, {isInstructor: true}] })
        .then(function (users) {

            const emails = users.map(user => {
                return {email:user.email,name:user.fullname}
            });
            if (emails.length < 1){
                return q.reject('No Users Found');
            }
            EmailSvc.sendGeneralEmail(emails, message, 'AAPP Instructor Announcement', sender)
            .then(function(){
                console.log('Email sent.');
            });

        });

}

function EmailAllMembers(message, sender) {
    return User.find({ $and:[{active: true}, {isMember: true}] })
        .then(function (users) {

            const emails = users.map(user => {
                return {email:user.email,name:user.fullname}
            });
            if (emails.length < 1){
                return q.reject('No Users Found');
            }
            EmailSvc.sendGeneralEmail(emails, message, 'AAPP Member Announcement', sender)
            .then(function(){
                console.log('Email sent.');
            });

        });

}

function EmailRegion(region, message, sender) {
    var query = {
        $and: [
            {isMember:true},
            { active: true }
        ]
    };

    return User.find(query)
        .then(function (users) {

            const emails = users.filter(user=>user.region === region).map(user => {
                console.log(user)
                return {email:user.email,name:user.fullname}
            });
            if (emails.length < 1){
                return q.reject('No Users Found');
            }
            EmailSvc.sendGeneralEmail(emails, message, 'AAPP Member Announcement', sender)
            .then(function(){
                console.log('Email sent.');
            });

        });
}

function Test(message, sender) {
    return User.find({isDeveloper:true})
        .then(function (users) {

            const emails = users.map(user => {
                return {email:user.email,name:user.fullname}
            });
            if (emails.length < 1){
                return q.reject('No Users Found');
            }
            EmailSvc.sendGeneralEmail(emails, message, 'Test', sender)
            .then(function(){
                console.log('Email sent.');
            });

        });

}

function Admin(message, sender) {
    return User.find({isAdmin:true,active:true })
        .then(function (users) {

            const emails = users.map(user => {
                return {email:user.email,name:user.fullname}
            });
            if (emails.length < 1){
                return q.reject('No Users Found');
            }
            EmailSvc.sendGeneralEmail(emails, message, 'AAPP Administrators Announcement', sender)
            .then(function(){
                console.log('Email sent.');
            });

        });

}

function MembersWithOutstandingOrPaidInvoices(outstanding,message, sender) {
    var query = {paid:true,payment:{$ne:null},user:{$ne:null}};
    if(outstanding){
        query = {paid:{$ne:true},payment:null,user:{$ne:null}};
    }
    return Invoice.find(query).populate('user')
        .then(function (invoices) {
            invoices.forEach((invoice)=>{
                if(invoice.user){
                    
                    const emails = [{email:invoice.user.email, name:invoice.user.fullname}];
                
                    EmailSvc.sendGeneralEmail(emails, message, 'AAPP Payments Announcement', sender)
                    .then(function(){
                        console.log('Email sent.');
                    });
                }
            });
        });

}

module.exports = router;
