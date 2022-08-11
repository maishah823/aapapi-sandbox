var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var Invoice = require('../../models/invoice');
var Payment = require('../../models/payment');
var Credit = require('../../services/credit');
var Attendee = require('../../models/attendeeInfo');
var Guest = require('../../models/guest');
var MembershipApplication = require('../../models/membershipApplication');
var Instructor = require('../../models/instructor');
var Redis = require('../../services/redisSvc');
var ApiError = require('../../classes/ApiError');
var adminGuard = require('../../guards/admin.guard');
var confGuard = require('../../guards/conf.guard');
var Validators = require('../../validators');
var validator = require('validator');
var q = require('q');
var Quickbooks = require('../../services/quickbooks');
var moment = require('moment');
var fs = require('fs');

var AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.AWS_ID, secretAccessKey: process.env.AWS_SECRET, region: 'us-east-2' });
var s3 = new AWS.S3();


router.get('/list', adminGuard, (req, res) => {
    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var query = {};
    var queryItems = [];
    if (!req.decoded.isDeveloper) {
        queryItems.push({ email: { $ne: 'gregharkins@harcomtech.com' } });
        queryItems.push({ _id: { $ne: req.decoded._id } });
    }

    if (!req.query.suspended) {
        queryItems.push({ active: true });
    }
    if (req.query.search) {
        queryItems.push({
            $or: [
                { "lastName": { $regex: new RegExp(req.query.search), $options: 'i' } },
                { "firstName": { $regex: new RegExp(req.query.search), $options: 'i' } },
                { "email": { $regex: new RegExp(req.query.search), $options: 'i' } },
                { "memberNumber": { $regex: new RegExp(req.query.search), $options: 'i' } }
            ]
        });
    }
    if (req.query.type) {
        switch (req.query.type) {
            case 'members':
                queryItems.push({ isMember: true });
                break;
            case 'admins':
                queryItems.push({ isAdmin: true });
                break;
            case 'attendees':
                queryItems.push({ isAttendee: true });
                break;
            case 'educators':
                queryItems.push({ isEducator: true });
                break;
            case 'instructors':
                queryItems.push({ isInstructor: true });
                break;
            default:

        }
    }
    if (queryItems.length > 0) {
        query = { $and: [...queryItems] };
    }

    User.paginate(query, { page: page, limit: limit, sort: { 'lastName': 1 }, select: 'active memberNumber firstName lastName region email address isAdmin isMember isInstructor isAttendee isEducator adminForSchool passwordIsTemp groups memberInfo memberLevel certNumber certExpiration certYear', populate: [{ path: 'memberInfo', select: 'finalApproved finalApprovedOn rejected rejectedOn' }] })
        .then(function (users) {
            return res.json(users);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Listing', 'Could not retrieve users listing.'));
        });
});

router.get('/download-upgrade-form',(req,res)=>{
    fs.readFile(__dirname + '/../../forms/aapp-membership-upgrade.pdf',function(err,file){
        if(err){
            return res.status(500).send(new ApiError('File Error', 'Could not retrieve upgrade form.'));
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=AAPP_Membership_Upgrade.pdf');
        res.send(file);
    });
})

router.get('/remove-school-admin/:userId', adminGuard, (req, res) => {
    if (!Validators.isValidObjectId(req.params.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Could not change permission.'));
    }
    return User.findByIdAndUpdate(req.params.userId, { isEducator: false, adminForSchool: null })
        .then(function (user) {
            res.json({ complete: true });
            //If the old values were previously set, the user was changed
            if (!user.isEducator && !user.adminForSchool) {
                const msg = `${req.decoded.name} removed school admin permissions for ${user.fullname}`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
            }
            return;
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not change permission.'));
        });
});

router.post('/add-school-admin', adminGuard, (req, res) => {
    if (!Validators.isValidObjectId(req.body.userId) || !Validators.isValidObjectId(req.body.school)) {
        return res.status(400).send(new ApiError('User Update', 'Could not change permission.'));
    }
    return User.findByIdAndUpdate(req.body.userId, { isEducator: true, adminForSchool: req.body.school })
        .then(function (user) {
            res.json({ complete: true });
            //If the old values were previously set, the user was changed
            if (user.adminForSchool != req.body.school) {
                const msg = `${req.decoded.name} updated school admin permissions for ${user.fullname}`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
            }
            return;
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not change permission.'));
        });
});

router.post('/make-admin', adminGuard, (req, res) => {
    if (req.decoded.groups.indexOf('makeAdmins') < 0) {
        res.status(403).send(new ApiError('Security', 'Logging out for trying to access a secure resource.'));
        Redis.writeToLog('Security', `${decoded.name} attempted to make a new adminstrator without permission to do so.`);
        return;
    }
    if (!Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Could not change permission.'));
    }
    return User.findByIdAndUpdate(req.body.userId, { isAdmin: true })
        .then(function (user) {
            res.json({ complete: true });
            //If the old value was false, the user was changed
            if (!user.isAdmin) {
                const msg = `${req.decoded.name} made ${user.fullname} an adminstrator.`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
            }
            return;
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not change permission.'));
        });
});

router.post('/revoke-admin', adminGuard, (req, res) => {
    if (req.decoded.groups.indexOf('makeAdmins') < 0) {
        res.status(403).send(new ApiError('Security', 'Logging out for trying to access a secure resource.'));
        Redis.writeToLog('Security', `${decoded.name} attempted to revoke adminstrator status without permission to do so.`);
        return;
    }
    if (!Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Could not change permission.'));
    }
    return User.findByIdAndUpdate(req.body.userId, { isAdmin: false })
        .then(function (user) {
            res.json({ complete: true });
            //If the old value was false, the user was changed
            if (user.isAdmin) {
                const msg = `${req.decoded.name} revoked ${user.fullname}'s admin permissions.`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
            }
            return;
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not change permission.'));
        });
});

router.post('/suspend', adminGuard, (req, res) => {

    if (!Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Could not suspend user.'));
    }
    return User.findByIdAndUpdate(req.body.userId, { active: false })
        .then(function (user) {
            res.json({ complete: true });
            //If the old value was set, then user was changed
            if (user.active) {
                const msg = `${req.decoded.name} suspended ${user.fullname}.`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
            }
            return;
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not suspend user.'));
        });
});

router.post('/toggle-delinquent-dues-status', adminGuard,
    (req, res) => {

    if (!Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Could not change user status to delinquent dues.'));
    }
    return User.findByIdAndUpdate(req.body.userId, { isDelinquentDues: req.body.status })
        .then(function (user) {
            res.json({ complete: true });
            //If the old value was set, then user was changed
            if (isDelinquentDues) {
                const msg = `${req.decoded.name} isDelinquentDues ${user.fullname}.`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
            }
            return;
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not suspend user.'));
        });
});

router.post('/reinstate', adminGuard, (req, res) => {

    if (!Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Could not reinstate user.'));
    }
    return User.findByIdAndUpdate(req.body.userId, { active: true })
        .then(function (user) {
            res.json({ complete: true });
            //If the old value was set, then user was changed
            if (!user.active) {
                const msg = `${req.decoded.name} reinstated ${user.fullname}.`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
            }
            return;
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not reinstate user.'));
        });
});

router.post('/reset-password', adminGuard, (req, res) => {

    if (!Validators.isValidObjectId(req.body.userId) || !req.body.password) {
        return res.status(400).send(new ApiError('User Update', 'Could not reset password.'));
    }
    return User.findById(req.body.userId)
        .then(function (user) {
            if (user) {
                user.password = req.body.password;
                user.passwordIsTemp = true;
                return user.save()
                    .then(function (savedUser) {
                        res.json({ complete: true });
                        const msg = `${req.decoded.name} set a new temporary password for ${savedUser.fullname}.`;
                        console.log(msg);
                        Redis.writeToLog('User Updates', msg);
                        return;
                    })
                    .catch(function (err) {
                        console.error(err);
                        return res.status(500).send(new ApiError('User Update', 'Could not reset password.'));
                    });
            } else {
                return res.status(500).send(new ApiError('User Update', 'Could not reset password.'));
            }

        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not reset password.'));
        });
});

router.post('/change-level', adminGuard, (req, res) => {

    if (!Validators.isValidObjectId(req.body.userId) || !req.body.level) {
        return res.status(400).send(new ApiError('User Update', 'Could not change level. Missing information.'));
    }
    return User.findById(req.body.userId)
        .then(function (user) {
            if (user) {
                if (req.body.level != user.memberLevel) {
                    user.memberLevel = req.body.level;
                    return user.save()
                        .then(function (savedUser) {
                            res.json({ complete: true });
                            const msg = `${req.decoded.name} changed ${savedUser.fullname}'s level to ${savedUser.memberLevel}.`;
                            console.log(msg);
                            Redis.writeToLog('User Updates', msg);
                            return;
                        })
                        .catch(function (err) {
                            console.error(err);
                            return res.status(500).send(new ApiError('User Update', 'Could not save changes.'));
                        });
                } else {
                    return res.status(500).send(new ApiError('User Update', 'Level is already set to: ' + req.body.level));
                }
            } else {
                return res.status(500).send(new ApiError('User Update', 'Could not locate user.'));
            }

        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'An error occured while setting member level.'));
        });
});

router.get('/self', (req, res) => {
    return User.findById(req.decoded._id).select('memberNumber groups firstName middleName lastName fullName address isMember isAdmin isAttendee isEducator isInstructor instructorInfo memberLevel email memberInfo')
        .populate([
            { path: 'memberInfo', select: 'memberClass finalApprovedOn' },
            { path: 'instructorInfo' }
        ])
        .then(function (user) {
            return res.json(user);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Profile', 'Sorry, can not fetch your information at this time.'));
        })
});

router.post('/updateOwnEmail', (req, res) => {
    if (typeof req.body.email != 'string') {
        return res.status(400).send(new ApiError('User Profile', 'Improper request.'));
    }
    const email = req.body.email.toLowerCase();
    if (!validator.isEmail(email)) {
        return res.status(400).send(new ApiError('User Profile', 'Improperly formatted email address.'));
    }


    return User.findByIdAndUpdate(req.decoded._id, { email })
        .then(function (user) {
            res.json({ complete: true });
            const msg = `${user.fullname} updated their own email from ${user.email} to ${email}`;
            Quickbooks.updateCustomer(Object.assign(user.toJSON(),{email:email})).then(function () { console.log(user.fullname + ' has updated email address to ' + email) });
            Redis.sendToWorker('notifyUserUpdate', { type: 'email', firstName: user.firstName, lastName: user.lastName, address: user.address, email: email });
            Redis.writeToLog('User Updates', msg);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Profile', 'Sorry, can not update your email at this time.'));
        });
});

router.post('/adminUpdateEmail', adminGuard, (req, res) => {
    if (typeof req.body.email != 'string' || !Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Profile', 'Improper request.'));
    }
    const email = req.body.email.toLowerCase();
    if (!validator.isEmail(email)) {
        return res.status(400).send(new ApiError('User Profile', 'Improperly formatted email address.'));
    }


    return User.findByIdAndUpdate(req.body.userId, { email })
        .then(function (user) {
            res.json({ complete: true });
            const msg = `${req.decoded.name} updated ${user.fullname}'s email from ${user.email} to ${email}`;
            Quickbooks.updateCustomer(Object.assign(user.toJSON(),{email:email})).then(function () { console.log(req.decoded.name + ' has updated email for '+ user.fullname + ' to ' + email) });
            Redis.sendToWorker('notifyUserUpdate', { type: 'email', firstName: user.firstName, lastName: user.lastName, address: user.address, email: email });
            Redis.writeToLog('Critical Changes', msg);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Profile', 'Sorry, can not update your email at this time.'));
        });
});

router.post('/adminUpdateName', adminGuard, (req, res) => {
    if (typeof req.body.firstName != 'string' || typeof req.body.firstName != 'string' || !Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Profile', 'Improper request.'));
    }
   
    return User.findByIdAndUpdate(req.body.userId, { firstName:req.body.firstName, lastName:req.body.lastName })
        .then(function (user) {
            res.json({ complete: true });
            const msg = `${req.decoded.name} updated ${user.fullname}'s name to ${req.body.firstName} ${req.body.lastName}`;
            Quickbooks.updateCustomer(Object.assign(user.toJSON(),{firstName:req.body.firstName, lastName:req.body.lastName})).then(function () { console.log(req.decoded.name + ' updated ' + user.fullname + ' to ' + req.body.firstName + ' ' + req.body.lastName) });
            Redis.sendToWorker('notifyUserUpdate', { type: 'name', firstName: req.body.firstName, lastName: req.body.lastName, address: user.address, email: user.email });
            Redis.writeToLog('Critical Changes', msg);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Profile', 'Sorry, can not update your email at this time.'));
        });
});

router.post('/updateOwnAddress', (req, res) => {

    if (!req.body.address || !req.body.address.street1 || !req.body.address.city || !req.body.address.state || !req.body.address.zip || !req.body.address.country || !req.body.address.workPhone) {
        return res.status(400).send(new ApiError('User Profile', 'Address incomplete. Could not update.'));
    }
    const address = req.body.address;

    return User.findByIdAndUpdate(req.decoded._id, { address }, { new: true })
        .then(function (user) {
            res.json({ complete: true });
            Redis.publish('all', 'usersChanged', user._id);
            const msg = `${user.fullname} updated their own address.`;
            Quickbooks.updateCustomer(user).then(function () { console.log(user.fullname + ' has updated address to ' + user.address) }).catch(function (err) { console.error(err); });
            Redis.sendToWorker('notifyUserUpdate', { type: 'address', firstName: user.firstName, lastName: user.lastName, address: user.address, email: user.email });
            Redis.sendToWorker('generalStats', 'memberUpdates');
            Redis.writeToLog('User Updates', msg);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Profile', 'Sorry, can not update your address at this time.'));
        });
});

router.post('/update-users-address', adminGuard, (req, res) => {

    if (!req.body.userId || !Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Unknown user.'));
    }

    if (!req.body.address || !req.body.address.street1 || !req.body.address.city || !req.body.address.state || !req.body.address.zip || !req.body.address.country || !req.body.address.workPhone) {
        return res.status(400).send(new ApiError('User Update', 'Address incomplete. Could not update.'));
    }
    const address = req.body.address;

    return User.findByIdAndUpdate(req.body.userId, { address }, { new: true })
        .then(function (user) {
            res.json({ complete: true });
            Redis.publish('all', 'usersChanged', user._id);
            const msg = `${req.decoded.name} changed ${user.fullname}'s address.`;
            Quickbooks.updateCustomer(user).then(function () { console.log(user.fullname + ': address updated.') }).catch(function (err) { console.error(err); });
            Redis.sendToWorker('generalStats', 'memberUpdates');
            Redis.writeToLog('User Updates', msg);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Sorry, can not update the address at this time.'));
        });
});

router.post('/update-cert-number', adminGuard, (req, res) => {

    if (!req.body.userId || !Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Unknown user.'));
    }

    if (!req.body.certNumber) {
        return res.status(400).send(new ApiError('User Update', 'No cert number provided.'));
    }

    const certNumber = req.body.certNumber;

    return User.findByIdAndUpdate(req.body.userId, { certNumber }, { new: true })
        .then(function (user) {
            res.json({ complete: true });
            Redis.publish('all', 'usersChanged', user._id);
            const msg = `${req.decoded.name} changed ${user.fullname}'s cert number.`;
            Redis.writeToLog('User Updates', msg);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Sorry, can not update the cert number at this time.'));
        });
});

router.post('/update-cert-year', adminGuard, (req, res) => {

    if (!req.body.userId || !Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Unknown user.'));
    }

    if (!req.body.certYear) {
        return res.status(400).send(new ApiError('User Update', 'Did not provide an expiration year.'));
    }

    //Compile a date from the year: certExpiration
    var year = req.body.certYear;
    year = year.replace(/[\D]/g, '');


    if (year.length < 4) {
        return res.status(500).send(new ApiError('User Update', 'You must enter a four digit year.'));
    }
    year = year.substring(0, 4);
    const certExpiration = moment().year(year).endOf('year').toDate();

    return User.findByIdAndUpdate(req.body.userId, { certExpiration }, { new: true })
        .then(function (user) {
            res.json({ expiration: certExpiration, year: year });
            Redis.publish('all', 'usersChanged', user._id);
            const msg = `${req.decoded.name} changed ${user.fullname}'s cert expiration date.`;
            Redis.writeToLog('User Updates', msg);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Sorry, could not update the cert expiration.'));
        });
});

router.get('/getOwnInvoices', (req, res) => {

    var promises = [];

    promises.push(
        Invoice.find({ user: req.decoded._id }).populate([{ path: 'payment' }, { path: 'couponCode', select: 'code type' }]).sort({ created_at: -1 })

    );
    promises.push(
        Attendee.find({ user: req.decoded._id }).populate([{ path: 'invoiceRef', populate: [{ path: 'payment' }, { path: 'couponCode', select: 'code type' }] }]).select('invoiceRef')
    );
    promises.push(
        MembershipApplication.find({ user: req.decoded._id }).populate([{ path: 'invoiceRef', populate: [{ path: 'payment' }, { path: 'couponCode', select: 'code type' }] }]).select('invoiceRef')
    );
    return q.all(promises)
        .then(function (results) {
            var theSet = new Set();
            const compiled = [...results[0], ...results[1].map(record => record.invoiceRef), ...results[2].map(record => record.invoiceRef)];
            return res.json(compiled.filter(inv => {
                if (!theSet.has(inv.invoiceNumber)) {
                    theSet.add(inv.invoiceNumber);
                    return inv;
                }
            }).sort((x, y) => {
                // false values first
                return (x.paid === y.paid) ? 0 : x.paid ? 1 : -1;
            }));
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Payment History', 'Could not retrieve payment history.'));
        });
});

router.post('/resetOwnPassword', (req, res) => {

    if (!req.body.password) {
        return res.status(400).send(new ApiError('User Profile', 'Incomplete Request.'));
    }
    const password = req.body.password;

    return User.findById(req.decoded._id)
        .then(function (user) {
            if (user) {
                user.password = password;
                user.passwordIsTemp = false;
                user.needsCreds = false;
                user.allowReset = false;
                return user.save()
                    .then(function (savedUser) {
                        res.json({ complete: true });
                        const msg = `${savedUser.fullname} changed their password.`;
                        Redis.writeToLog('User Updates', msg);
                    })
                    .catch(function (err) {
                        console.error(err);
                        return res.status(500).send(new ApiError('User Profile', 'Sorry, can complete your request at this time.'));
                    });
            } else {
                return res.status(500).send(new ApiError('User Profile', 'Sorry, can complete your request at this time.'));
            }

        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Profile', 'Sorry, can complete your request at this time.'));
        });
});

router.post('/make-regional-manager', adminGuard, (req, res) => {
    if (req.decoded.groups.indexOf('makeAdmins') < 0) {
        res.status(403).send(new ApiError('Security', 'Logging out for trying to access a secure resource.'));
        Redis.writeToLog('Security', `${decoded.name} attempted to make a new regional manager without permission to do so.`);
        return;
    }
    if (!Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Could not change permission.'));
    }
    return User.findById(req.body.userId)
        .then(function (user) {
            if (user.groups.indexOf('regional-manager') > -1) {
                return res.status(400).send(new ApiError('User Update', 'User is already a regional manager.'));
            }
            if (!user.isAdmin) {
                return res.status(400).send(new ApiError('User Update', 'User is not an administrator.'));
            }
            user.groups.push('regional-manager');
            return user.save()
                .then(function (savedUser) {
                    res.json({ complete: true });
                    const msg = `${req.decoded.name} made ${savedUser.fullname} a regional manager.`;
                    console.log(msg);
                    Redis.writeToLog('User Updates', msg);
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('User Update', 'Could not change permission.'));
                });

        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not change permission.'));
        });
});

router.post('/revoke-regional-manager', adminGuard, (req, res) => {
    if (req.decoded.groups.indexOf('makeAdmins') < 0) {
        res.status(403).send(new ApiError('Security', 'Logging out for trying to access a secure resource.'));
        Redis.writeToLog('Security', `${decoded.name} attempted to revoke adminstrator status without permission to do so.`);
        return;
    }
    if (!Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Could not change permission.'));
    }
    return User.findById(req.body.userId)
        .then(function (user) {
            if (user.groups.indexOf('regional-manager') < 0) {
                return res.status(400).send(new ApiError('User Update', 'User is not currently a regional manager.'));
            }

            user.groups.splice(user.groups.indexOf('regional-manager'), 1);
            return user.save()
                .then(function (savedUser) {
                    res.json({ complete: true });
                    const msg = `${req.decoded.name} UNASSIGNED ${savedUser.fullname} from regional manager status.`;
                    console.log(msg);
                    Redis.writeToLog('User Updates', msg);
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('User Update', 'Could not change permission.'));
                });

        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not change permission.'));
        });
});

//Instructor
router.post('/make-instructor', adminGuard, (req, res) => {

    if (!Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Could not change permission.'));
    }
    return User.findById(req.body.userId)
        .then(function (user) {
            if (user.isInstructor) {
                return res.status(400).send(new ApiError('User Update', 'User is already an instructor.'));
            }
            user.isInstructor = true;
            if (!user.instructorInfo) {
                const instructorInfo = new Instructor({ user: user._id });
                user.instructorInfo = instructorInfo;
                instructorInfo.save();
            }
            return user.save()
                .then(function (savedUser) {
                    res.json({ complete: true });
                    const msg = `${req.decoded.name} made ${savedUser.fullname} an instructor.`;
                    console.log(msg);
                    Redis.writeToLog('User Updates', msg);
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('User Update', 'Could not change permission.'));
                });

        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not change permission.'));
        });
});

router.post('/revoke-instructor', adminGuard, (req, res) => {
    if (!Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Could not change permission.'));
    }
    return User.findById(req.body.userId)
        .then(function (user) {
            if (!user.isInstructor) {
                return res.status(400).send(new ApiError('User Update', 'User is not currently an instructor.'));
            }

            user.isInstructor = null;
            return user.save()
                .then(function (savedUser) {
                    res.json({ complete: true });
                    const msg = `${req.decoded.name} UNASSIGNED ${savedUser.fullname} from instructor status.`;
                    console.log(msg);
                    Redis.writeToLog('User Updates', msg);
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(500).send(new ApiError('User Update', 'Could not change permission.'));
                });

        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not change permission.'));
        });
});

router.post('/instructor-update', (req, res) => {
    if (req.body.field != "summary"
        && req.body.field != "education"
        && req.body.field != "research"
        && req.body.field != "title") {
        return res.status(400).send(new ApiError('User Update', 'Error updating instructor info.'));
    }
    if (!req.body.content) {
        return res.status(400).send(new ApiError('User Update', 'Cannot update to empty text.'));
    }
    if (!req.body.userId) {
        return res.status(400).send(new ApiError('User Update', 'User is unkonwn.'));
    }
    if (!req.decoded.isAdmin) {
        if (req.body.userId != req.decoded._id) {
            return res.status(400).send(new ApiError('User Update', 'You do not have permission to update this user.'));
            const msg = `${req.decoded.name} attempted to change instructor info without permission`;
            console.log(msg);
            Redis.writeToLog('Security', msg);
        }
    }
    return Instructor.findOneAndUpdate({ user: req.body.userId }, { [req.body.field]: req.body.content })
        .then(function (savedInstructor) {
            res.json({ complete: true });
            if (savedInstructor.user == req.decoded._id) {
                const msg = `${req.decoded.name} changed their own ${req.body.field} in instructor details.`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
                return;
            }
            return savedInstructor.populate('user', (err, populated) => {
                if (err) {
                    console.error(err);
                    return;
                }
                const msg = `${req.decoded.name} changed ${populated.user.fullname}'s ${req.body.field} in instructor details.`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
            });

        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not change instructor information.'));
        });
});

router.post('/add-topic', (req, res) => {
    if (!req.body.userId || !req.body.topic) {
        return res.status(400).send(new ApiError('User Update', 'Cannot add topic.'));
    }
    if (!req.decoded.isAdmin) {
        if (req.body.userId != req.decoded._id) {
            return res.status(400).send(new ApiError('User Update', 'You do not have permission to add a topic.'));
            const msg = `${req.decoded.name} attempted to add a topic to another user without permission.`;
            console.log(msg);
            Redis.writeToLog('Security', msg);
        }
    }
    Instructor.findOneAndUpdate({ user: req.body.userId }, { $addToSet: { topics: req.body.topic } })
        .then(function (instructor) {
            res.json({ complete: true });
            if (instructor.user == req.decoded._id) {
                const msg = `${req.decoded.name} added a topic to their own instructor details.`;
                Redis.writeToLog('User Updates', msg);
                return;
            }
            return instructor.populate('user', (err, populated) => {
                if (err) {
                    console.error(err);
                    return;
                }
                const msg = `${req.decoded.name} added a topic to ${populated.user.fullname}'s instructor details.`;
                Redis.writeToLog('User Updates', msg);
            });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not add topic to instructor.'));
        });
});

router.post('/remove-topic', (req, res) => {
    if (!req.body.userId || !req.body.topic) {
        return res.status(400).send(new ApiError('User Update', 'Cannot remove topic.'));
    }
    if (!req.decoded.isAdmin) {
        if (req.body.userId != req.decoded._id) {
            return res.status(400).send(new ApiError('User Update', 'You do not have permission to remove a topic.'));
            const msg = `${req.decoded.name} attempted to remove a topic from another user without permission.`;
            console.log(msg);
            Redis.writeToLog('Security', msg);
        }
    }
    return Instructor.findOneAndUpdate({ user: req.body.userId }, { $pull: { topics: req.body.topic } })
        .then(function (instructor) {
            res.json({ complete: true });
            if (req.decoded._id == instructor.user) {
                const msg = `${req.decoded.name} removed a topic from their own instructor details.`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
                return;
            }
            return instructor.populate('user', (err, populated) => {
                const msg = `${req.decoded.name} removed a topic from ${populated.user.fullname}'s instructor details.`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
            });

        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not remove topic from instructor.'));
        });
});

router.post('/instructor-sign', function (req, res) {
    if (!req.body.filename || !req.body.contenttype) {
        return res.status(400).send(new ApiError('File Upload', 'No file info received.'));
    }

    var filename = req.body.filename;
    var contenttype = req.body.contenttype;

    var params = {
        Bucket: process.env.INSTRUCTORS_BUCKET,
        Key: filename,
        Expires: 60,
        ContentType: contenttype,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', params, function (err, url) {
        if (err) {
            console.error(err);
            return res.status(400).send(new ApiError('File Upload', 'Error signing request.'));
        } else {
            res.json({ url: url });
            console.log(url);
        }
    });
});

router.post('/update-instructor-image', (req, res) => {
    if (!req.body.userId || !req.body.filename) {
        return res.status(400).send(new ApiError('File Upload', 'Error associating new picture.'));
    }
    if (!req.decoded.isAdmin) {
        if (req.body.userId != req.decoded._id) {
            return res.status(400).send(new ApiError('User Update', 'You do not have permission to change the picture for this user.'));
            const msg = `${req.decoded.name} attempted to change the picture of another user without permission.`;
            console.log(msg);
            Redis.writeToLog('Security', msg);
        }
    }
    Instructor.findOneAndUpdate({ user: req.body.userId }, { picture: req.body.filename })
        .then(function (instructor) {
            res.json({ complete: true });
            if (req.decoded._id == instructor.user) {
                const msg = `${req.decoded.name} updated their own instructor picture.`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
                return;
            }
            return instructor.populate('user', (err, populated) => {
                const msg = `${req.decoded.name} updated ${populated.user.fullname}'s instructor picture.`;
                console.log(msg);
                Redis.writeToLog('User Updates', msg);
            });

        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not change instructor picture.'));
        });
});

router.post('/archive', adminGuard, (req, res) => {

    if (!req.decoded.isDeveloper) {
        return res.status(403).send(new ApiError('Security', 'You are not authorized to do this.'));
    }

    if (!Validators.isValidObjectId(req.body.userId)) {
        return res.status(400).send(new ApiError('User Update', 'Could not archive user.'));
    }
    return User.findById(req.body.userId)
        .then(function (user) {
            if (!user) {
                return res.status(400).send(new ApiError('User Update', 'User not found.'));
            }
            let oldEmail = user.email;
            user.email = 'ARCHIVED-' + user.email;
            return user.save()
                .then(function (saved) {
                    res.json({ complete: true });
                    Redis.writeToLog('User Updates', `The developer archived an inactive user.`);
                    Redis.client.srem('used-emails', oldEmail, () => {

                    });
                });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('User Update', 'Could not suspend user.'));
        });
});

router.get('/my-conf-info', confGuard, async (req, res) => {

    try {
        var conf = await Redis.getCurrentConference();
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Conference', 'Could not determine current conference.'));
    }

    return Attendee.findOne({ user: req.decoded._id, conference: conf })
        .populate([
            { path: 'guests', populate: [{ path: 'events', select: 'name' }] },
            { path: 'events', select:'name startDateTime endDateTime timezone'},
            { path: 'invoiceRef' },
            { path: 'conference', select: 'city state startDateTime endDateTime timezone' },
            { path: 'finalApprovedBy', select: 'firstName lastName' },
            { path: 'checkedInBy', select: 'firstName lastName' }
        ])
        .then(function (attendeeInfo) {
            if (attendeeInfo) {
                return res.json(attendeeInfo);
            }
            throw new Error("MY CONF INFO: Could not find attendeeInfo for user.");
        })
        .catch(function (err) {
            console.error(err);
            return res.status(400).send(new ApiError('Conference', 'Could not locate conference info.'));
        });
});

router.post('/addGuest', confGuard, async (req, res) => {

    var tracking = {};

    //Check info.
    if (!req.body.guestInfo) {
        return res.status(400).send(new ApiError('Guest Addition', 'Improper Information'));
    }
    const guestInfo = req.body.guestInfo;
    if (!guestInfo.paymentGroup || !guestInfo.guests || !guestInfo.total) {
        return res.status(400).send(new ApiError('Guest Addition', 'Missing Information.'));
    }
    if (guestInfo.guests.length < 1) {
        return res.status(400).send(new ApiError('Guest Addition', 'Missing guest information.'));
    }
    const paymentGroup = guestInfo.paymentGroup;
    if (!paymentGroup.cc || !paymentGroup.expMonth || !paymentGroup.expYear || !paymentGroup.cvv) {
        return res.status(400).send(new ApiError('Guest Addition', 'Payment Information is incomplete.'));
    }


    //Get current conference
    try {
        var conf = await Redis.getCurrentConference();
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Guest Addition', 'Could not determine current conference.'));
    }

    //Get Attendee Info, populate user.
    try {
        var attendee = await Attendee.findOne({ conference: conf, user: req.decoded._id }).populate('user');
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Guest Addition', 'Sorry, we could not find your registration.'));
    }

    if (!attendee) {
        return res.status(400).send(new ApiError('Guest Addition', 'Sorry, we could not find your registration.'));
    }

    var customerId;

    if (!attendee.user.customerId) {
        try {
            customerId = await Quickbooks.createCustomer(null, attendee.user.firstName, null, attendee.user.lastName, attendee.user.address, attendee.user.email);
            await User.findByIdAndUpdate(attendee.user, { customerId });
        } catch (e) {
            console.error(e);
            return res.status(400).send(new ApiError('Guest Addition', 'Sorry, we could not complete the transaction.'));
        }

    } else {
        customerId = attendee.user.customerId;
    }

    //Generate Description
    var description = "";
    guestInfo.guests.forEach((guest) => {
        description = description + " - " + guest.name;
    });


    try {
        var qbResponse = await Quickbooks.createGuestInvoice(attendee.user.email, guestInfo.total, customerId, description);
        tracking.qbInvoice = qbResponse.invoiceId;
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Guest Addition', 'Sorry, there was an error processing your order.'));
    }

    //Create internal invoice

    const invoice = new Invoice({
        user: req.decoded._id,
        invoiceRef: qbResponse.invoiceId,
        invoiceNumber: qbResponse.invoiceNumber,
        type: 'Guest Registration',
        memo: description,
        amount: guestInfo.total
    });
    tracking.invoice = invoice._id;


    //Process Credit Card
    try {
        var transaction = await processCreditCardPayment(guestInfo.total, paymentGroup.cc, paymentGroup.expMonth, paymentGroup.expYear, paymentGroup.cvv, attendee.user.firstName + ' ' + attendee.user.lastName, attendee.user.email, attendee.user.address);
        tracking.transaction = transaction;
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Guest Addition', 'Error processing your credit card. Please check your card details.'));
    }

    //Create quickbooks payment.
    try {
        var paymentResponse = await Quickbooks.payInvoice(qbResponse.invoiceId)
        tracking.qbPayment = paymentResponse;
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Guest Addition', 'Sorry, there was an error processing your order.'));
    }

    //Create internal payment.
    const payment = new Payment({
        firstName: attendee.user.firstName,
        lastName: attendee.user.lastName,
        address: attendee.user.address,
        email: attendee.user.email,
        invoiceNumbers: [qbResponse.invoiceNumber],
        transaction: transaction,
        qbPayment: paymentResponse,
        amount: guestInfo.total
    });

    tracking.payment = payment._id;

    invoice.paid = true;
    invoice.payment = payment._id;

    var guestIds = [];

    try {
        await invoice.save();
        await payment.save();
        for (var i = 0; i < guestInfo.guests.length; i++) {
            var newGuest = new Guest({ ...guestInfo.guests[i], conference: conf, paid: true });
            var savedGuest = await newGuest.save();
            guestIds.push(savedGuest._id)
            await Attendee.findByIdAndUpdate(attendee._id, { $push: { guests: savedGuest._id } });
        }
        res.json({});

    } catch (e) {
        console.error(e);
        res.status(400).send(new ApiError('Guest Addition', 'Sorry, Guest Registration failed.'));
        if (guestIds.length > 0) {
            guestIds.forEach( async element => {
                console.log("DELETING GUEST: ", element);
                await Guest.findByIdAndRemove(element);
            });
        }
        if (tracking.transaction) {
            Credit.refundTransaction(tracking.transaction, 'Guest registration failed after payment was processed.');
        }
        if (tracking.qbInvoice) {
            Quickbooks.deleteInvoice(traking.qbInvoice);
        }
        if (tracking.qbPayment) {
            Quickbooks.deletePayment(tracking.qbPayment);
        }
        if (traking.invoice) {
            await Invoice.findByIdAndRemove(tracking.invoice);
        }
        if (traking.payment) {
            await Payment.findByIdAndRemove(tracking.payment);
        }
    }



    function processCreditCardPayment(total, cc, expMonth, expYear, cvv, name, email, address, description) {
        if (!total || total <= 0) {
            return q.reject('Amount calculation was incorrect. Please contact the National Office.');
        }
        return Credit.payAttendeeWithCard(total, cc, expMonth, expYear, cvv, name, email, address, description)
            .then(function (transaction) {
                if (transaction) {
                    return q.resolve(transaction);
                } else {
                    return q.reject("Could not process payment. Please check your card information.");
                }
            })
    }

});


module.exports = router;