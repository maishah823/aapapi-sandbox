var q = require('q');
var User = require('../models/user');
var validator = require('validator');
var generator = require('generate-password');
var jwt = require('jsonwebtoken');
var Attendee = require('../models/attendeeInfo');
var Redis = require('../services/redisSvc');
var Quickbooks = require('../services/quickbooks');
var Invoice = require('../models/invoice');
var Payment = require('../models/payment');
var Credit = require('../services/credit');
var Guest = require('../models/guest');
var Invoice = require('../models/invoice');
var Payment = require('../models/payment');
var Rep = require('../models/representative');
var Coupon = require('../models/coupon');

module.exports = function (type, record) {

    //MODULE RETURNS PROMISE
    //NOTE: Add ID to appropriate cleanup array to have it deleted on failure.

    //Temporary placeholder. Will reject if not replaced with actual promise.
    var promise = q.promise(function (resolve, reject) {
        reject("Unknown Processor Type");
    });

    //Module Scope Variables
    var mainEmail;
    var qbInvoiceId;
    var resetUsers = [];
    const cleanup = {
        attendees: [],
        guests: [],
        users: []
    };
    var mainCouponId;

    switch (type) {
        case 'indv':
            //Set the correct email for progress dist
            mainEmail = record.emailGroup.email;
            var mainUser;
            var transaction;
            var invoiceId;
            //Progress
            Redis.publish('all', 'attendProgress', { type: 'info', email: mainEmail, message: 'Begin processing for individual...' });
            promise = findUserByEmail(mainEmail)
                .then(function (user) {
                    if (user) {
                        return authenticateIndvUser(user);
                    }
                    return createNewUser(mainEmail, record.infoGroup.firstName, record.infoGroup.lastName, record.infoGroup.address);
                })
                .then(function (user) {
                    mainUser = user;
                    if(record.discount){
                        return checkCoupon(record.coupon);
                    }
                })
                .then(function () {
                    if (record.paymentGroup.paymentType == 'credit') {
                        return processCreditCardPayment(record.total, record.paymentGroup.cc, record.paymentGroup.expMonth, record.paymentGroup.expYear, record.paymentGroup.cvv, record.infoGroup.firstName + ' ' + record.infoGroup.lastName, mainEmail.toLowerCase(), record.infoGroup.address);
                    }
                    return null;
                })
                .then(function (t) {
                    transaction = t;
                    return createQBInvoice(mainEmail, record.total, record.conferencePrice, record.guestPrice || 0, record.discount, mainUser.customerId, 'Conference Admission');
                })
                .then(createInvoiceRecord)
                .then(function (invoice) {
                    invoiceId = invoice._id;
                    //If Credit card was processed, pay invoice
                    if (transaction) {
                        return payQBInvoice(invoice.invoiceRef)
                            .then(function (paymentId) {
                                cleanup.qbPaymentId = paymentId;
                                return createPaymentRecord(record.infoGroup.firstName, record.infoGroup.lastName, record.infoGroup.address, invoice.invoiceNumber, invoice.invoiceAmount, transaction, paymentId)
                            });
                    }
                    return null;
                })
                .then(function (paymentId) {
                    if (paymentId) {
                        Invoice.findByIdAndUpdate(invoiceId, { payment: paymentId, paid: true }).exec();
                    }
                    console.log("GUESTS ", record.guests);
                    return createIndvGuests(record.guests);
                })
                .then(function (guests) {
                    return createAttendeeInfo(mainUser, record.events, guests, invoiceId, record.total, 'Individual registration');
                });
            break;
        case 'agency':
            //Set the correct email for progress dist
            mainEmail = record.infoGroup.email;
            var transaction;
            var invoiceId;

            promise = q.promise(function (resolve) {
                //Progress
                Redis.publish('all', 'attendProgress', { type: 'info', email: mainEmail, message: 'Begin processing for agency...' });
                resolve();
            })
            .then(function(){
                if(record.discount){
                    return checkCoupon(record.coupon);
                }

            })
                .then(function () {
                    if (record.paymentGroup.paymentType == 'credit') {
                        return processCreditCardPayment(record.total, record.paymentGroup.cc, record.paymentGroup.expMonth, record.paymentGroup.expYear, record.paymentGroup.cvv, record.infoGroup.firstName + ' ' + record.infoGroup.lastName, mainEmail.toLowerCase(), record.infoGroup.address, `${record.infoGroup.agency} - Bulk Registration`);
                    }
                })
                .then(function (t) {
                    transaction = t;
                    //Generate customer ID
                    return Quickbooks.createCustomer(null, record.infoGroup.firstName, record.infoGroup.middleName, record.infoGroup.lastName, record.infoGroup.address, record.infoGroup.email.toLowerCase())
                        .then(function (customerId) {
                            console.log('CUSTOMER ID:', customerId);
                            var names = "";
                            var participants = record.participants || [];
                            participants.forEach(participant => {
                                names = names + `, ${participant.firstName} ${participant.lastName}`;
                            });
                            return createQBInvoice(mainEmail, record.total, record.conferencePrice, 0, record.discount, customerId, `${record.infoGroup.agency} bulk registration` + names);
                        });

                })
                .then(createInvoiceRecord)
                .then(function (invoice) {
                    invoiceId = invoice._id;
                    //If Credit card was processed, pay invoice
                    if (transaction) {
                        return payQBInvoice(invoice.invoiceRef)
                            .then(function (paymentId) {
                                cleanup.qbPaymentId = paymentId;
                                return createPaymentRecord(record.infoGroup.firstName, record.infoGroup.lastName, record.infoGroup.address, invoice.invoiceNumber, invoice.invoiceAmount, transaction, paymentId)
                            });
                    } else {
                        return null;
                    }
                })
                .then(function (paymentId) {
                    if (paymentId) {
                        Invoice.findByIdAndUpdate(invoiceId, { payment: paymentId, paid: true }).exec();
                    }

                })
                .then(function () {
                    var generatePromises = [];
                    var participants = record.participants || [];
                    participants.forEach(participant => {
                        generatePromises.push(
                            findUserByEmail(participant.email.toLowerCase())
                                .then(function (user) {
                                    if (user) {
                                        return user;
                                    } else {
                                        return createNewUser(participant.email, participant.firstName, participant.lastName, null);
                                    }
                                })
                                .then(function (user) {
                                    return createAttendeeInfo(user, null, null, invoiceId, participant.cost, `Part of Agency Registration. ${record.infoGroup.agency}, ${record.infoGroup.address.city}, ${record.infoGroup.address.state}, Phone: ${record.infoGroup.address.workPhone}`);
                                })

                        );
                    });
                    if (generatePromises) {
                        return q.allSettled(generatePromises)
                            .then(function (results) {
                                var rejected;
                                var reason = '';
                                var num = 1;
                                results.forEach(result => {
                                    if (result.state == 'rejected') {
                                        rejected = true;
                                        reason = reason + " " + num + ". " + result.reason;
                                        num = num + 1;
                                    }
                                })
                                if (rejected) {
                                    return q.reject(reason);
                                }
                            });
                    }
                    //return null;
                });
            break;
        case 'vendor':
            //Set the correct email for progress dist
            mainEmail = record.infoGroup.email;
            var transaction;
            var invoiceId;
            var total = 0;
            Redis.publish('all', 'attendProgress', { type: 'info', email: mainEmail, message: 'Begin processing for agency...' });
            promise = checkVendorCoupon(record.coupon)
                .then(function (d) {
                    var discount = d || 0;
                    var cost = 500 - discount;
                    if (cost > 0) {
                        total = cost;
                        return processCreditCardPayment(cost, record.paymentGroup.cc, record.paymentGroup.expMonth, record.paymentGroup.expYear, record.paymentGroup.cvv, record.infoGroup.firstName + ' ' + record.infoGroup.lastName, mainEmail.toLowerCase(), record.infoGroup.address, `${record.infoGroup.company} Vendor Donation`);
                    }
                    return null;
                })
                .then(function (t) {
                    if (t) {
                        transaction = t;
                        //Generate customer ID
                        return Quickbooks.createCustomer(null, record.infoGroup.firstName, record.infoGroup.middleName, record.infoGroup.lastName, record.infoGroup.address, record.infoGroup.email.toLowerCase())
                            .then(function (customerId) {

                                return Quickbooks.createVendorInvoice(mainEmail, total, customerId, `${record.infoGroup.company} - Vendor Donation.`)
                            })
                            .then(createInvoiceRecord)
                            .then(function (invoice) {
                                invoiceId = invoice._id;
                                //If Credit card was processed, pay invoice
                                if (transaction) {
                                    return payQBInvoice(invoice.invoiceRef)
                                        .then(function (paymentId) {
                                            cleanup.qbPaymentId = paymentId;
                                            return createPaymentRecord(record.infoGroup.firstName, record.infoGroup.lastName, record.infoGroup.address, invoice.invoiceNumber, invoice.invoiceAmount, transaction, paymentId)
                                        });
                                }
                                return null;
                            })
                            .then(function (paymentId) {
                                if (paymentId) {
                                    Invoice.findByIdAndUpdate(invoiceId, { payment: paymentId, paid: true }).exec();
                                }

                            });
                    }

                })

                .then(function () {
                    var generatePromises = [];
                    const initialParticipant = new Rep({
                        firstName: record.infoGroup.firstName,
                        lastName: record.infoGroup.lastName,
                        email: record.infoGroup.email,
                        conference: process.env.currentconf,
                        company: record.infoGroup.company,
                        address: record.infoGroup.address
                    });
                    generatePromises.push(
                        initialParticipant.save()
                    );

                    var participants = record.participants || [];
                    participants.forEach(participant => {
                        var newParticipant = new Rep({
                            firstName: participant.firstName,
                            lastName: participant.lastName,
                            email: participant.email.toLowerCase(),
                            conference: process.env.currentconf,
                            company: record.infoGroup.company,
                            address: record.infoGroup.address
                        });
                        generatePromises.push(
                            newParticipant.save()
                        );
                    });
                    if (generatePromises) {
                        return q.all(generatePromises);
                    }
                    return null;
                });
            break;
        default:
            console.error("Conference attendance processor received unknown command.");
            return q.reject("ERROR PROCESSING.");
    }

    return promise
        .then(function () {
            if (qbInvoiceId) {
                Quickbooks.emailInvoice(qbInvoiceId);
            }
            return ({ complete: true })
        })
        .catch(function (err) {
            console.error('FINAL CONF PROCESSING ERROR: ', err);
            if (cleanup.users) {
                cleanup.users.forEach(element => {
                    console.log("DELETING USER: ", element);
                    User.findByIdAndRemove(element).then(function (u) {
                        Redis.client.srem("used-emails", u.email || 'unknown');
                    });

                });
            }
            if (cleanup.attendees) {
                cleanup.attendees.forEach(element => {
                    console.log("DELETING ATTENDEE: ", element);
                    Attendee.findByIdAndRemove(element).exec();
                });
            }
            if (cleanup.guests) {
                cleanup.guests.forEach(element => {
                    console.log("DELETING GUEST: ", element);
                    Guest.findByIdAndRemove(element).exec();
                });
            }
            if (cleanup.transaction) {
                Credit.refundTransaction(cleanup.transaction, 'Conference registration failed after payment was processed.');
            }
            if (cleanup.qbInvoiceId) {
                Quickbooks.deleteInvoice(cleanup.qbInvoiceId);
            }
            if (cleanup.qbPaymentId) {
                Quickbooks.deletePayment(cleanup.qbPaymentId);
            }
            if (cleanup.invoiceRecord) {
                Invoice.findByIdAndRemove(cleanup.invoiceRecord).exec();
            }
            if (cleanup.payment) {
                Payment.findByIdAndRemove(cleanup.payment).exec();
            }
            if (resetUsers) {
                resetUsers.forEach(u => { User.findByIdAndUpdate(u, { isAttendee: false, attendeePending:false, attendeeInfo: null }).exec() });
            }
            if (typeof err == 'string') {
                Redis.publish('all', 'attendProgress', { type: 'error', email: mainEmail, message: err });
                return q.reject(err);
            }
            return q.reject('Sorry, we have run into an issue. Please contact the National Office');
        });



    /* ----------------------------
        Utility Functions
        ---------------------------------*/

    //Takes an email, resolves a user if one exists or null if it doesn't. Will reject if email is not in the
    //correct format or if the user has already been successfully processed.
    function findUserByEmail(emailToCheck) {
        if (typeof emailToCheck.toLowerCase == 'function') {
            formattedEmail = emailToCheck.toLowerCase().trim();
        } else {
            return q.reject("An email address is missing.");
        }

        //If email doesn't exist, reject
        if (!formattedEmail) {
            return q.reject("An email address is missing.");
        }
        if (!validator.isEmail(formattedEmail)) {
            return q.reject("There was a malformed email address.");
        }

        return User.findOne({ email: formattedEmail })
            .then(function (user) {
                if (user) {
                    //User EXISTS
                    if (user.isAttendee || user.attendeePending || user.attendeeInfo) {
                        return q.reject('A participant email has previously been processed. You are attempting to duplicate a signup for ' + formattedEmail);
                    }
                    return user;

                } else {
                    return null;
                }
            });


    }

    //Takes a user object and resolves the same user if verified by the individuals token (only for individual flow).
    function authenticateIndvUser(user) {
        if (user.isAttendee || user.attendeePending || user.attendeeInfo) {
            return reject("Email is already been registered or is not available for use.");
        }
        if (!record.emailGroup.token) {
            return q.reject('Not authorized to sign up using this email address.');
        }
        return jwt.verify(record.emailGroup.token, process.env.JOIN_TOKEN_SECRET, function (err, decoded) {
            if (err) {
                console.error(err);
                return q.reject('Error authenticating user.');
            }
            if (decoded.email != user.email) {
                return q.reject('Not authorized to use this email. Try removing and adding email to reauthenticate it.');
            }
            if (!user.customerId) {
                return Quickbooks.createCustomer(null, user.firstName, null, user.lastName, user.address || {}, user.email)
                    .then(function (customerId) {
                        user.customerId = customerId;
                        return user.save();
                    })
            } else {
                Redis.publish('all', 'attendProgress', { type: 'info', email: decoded.email, message: 'Email authenicated...' });
                return q.resolve(user);
            }
        });
    }

    //Takes an email, firstName, lastName and address. Resolves the new user.
    function createNewUser(userEmail, firstName, lastName, address) {

        return Quickbooks.createCustomer(null, firstName, null, lastName, address || {}, userEmail)
            .then(function (customerId) {
                const password = generator.generate({
                    numbers: true,
                    symbols: true,
                    uppercase: true,
                    excludeSimilarCharacters: true,
                    strict: true
                });

                var newUser = new User({
                    email: userEmail,
                    firstName: firstName,
                    lastName: lastName,
                    password: password,
                    customerId: customerId
                });
                if (address) {
                    newUser.address = address;
                }

                cleanup.users.push(newUser._id);
                return newUser.save();
            });

    }

    //Takes array of guest objects from client, resolves an array of guest IDs if any were added (else empty array)
    function createIndvGuests(guests) {
        var guestPromises = [];
        var guestIds = [];
        for (var i = 0; i < guests.length; i++) {
            var aGuest = new Guest({
                conference: process.env.currentconf,
                name: guests[i].name,
                all: guests[i].all,
                events: guests[i].events
            });
            cleanup.guests.push(aGuest._id);
            guestIds.push(aGuest._id);
            guestPromises.push(aGuest.save());
        }
        if (guestPromises.length > 0) {
            return q.all(guestPromises)
                .then(function () {
                    return guestIds;
                })
        }
        return [];

    }

    //takes a user object, an array of event IDs that the user wishes to attend and an array of IDs of any guests. 
    //Resolves empty;
    function createAttendeeInfo(user, events, guests, invoiceId, rate, orderDescription) {

        var newAttendee = new Attendee({
            conference: process.env.currentconf,
            user: user._id,
            rate: rate,
            events: events,
            guests: guests,
            invoiceRef: invoiceId,
            orderDescription: orderDescription
        });

        if(user.attendeeInfo || user.isAttendee || user.attendeePending){
            return q.reject(`${user.email} is either already registered or is not eligible. Please contact the National Office for Assistance.`);
        }

        cleanup.attendees.push(newAttendee._id);
        user.attendeeInfo = newAttendee._id;
        if (user.isMember) {
            user.isAttendee = true;
            newAttendee.finalApproved = true;
            newAttendee.finalApprovedOn = new Date();
            newAttendee.finalApprovedBy = user._id;
        } else {
            user.attendeePending = true;
        }
        resetUsers.push(user._id);
        return q.all(newAttendee.save(), user.save())
            .then(function () {
                Redis.publish('all', 'attendProgress', { type: 'info', email: mainEmail, message: `Attempting to process ${user.email}...` });
                return q.resolve();
            });



    }

    //Takes total amount to charge, cc number, expMonth, expYear, cvv, payee name, payee email and payee address.
    function processCreditCardPayment(total, cc, expMonth, expYear, cvv, name, email, address, description) {
        if (!total || total <= 0) {
            return q.reject('Amount calculation was incorrect. Please contact the National Office.');
        }
        return Credit.payAttendeeWithCard(total, cc, expMonth, expYear, cvv, name, email, address, description)
            .then(function (transaction) {
                if (transaction) {
                    Redis.publish('all', 'attendProgress', { type: 'info', email: mainEmail, message: 'Payment processed...' });
                    cleanup.transaction = transaction;
                    return q.resolve(transaction);
                } else {
                    return q.reject("Could not process payment. Please check your card information.");
                }
            })
    }

    //Takes total, total conference fees, total guest fees, discount amount and customer Id.
    //Resolves quickbooks invoiceInfo (invoiceAmount, invoiceId, invoiceNumber)
    //Will fail if no customer ID is provided. Be sure to make ID prior.
    function createQBInvoice(email, total, conferencePrice, guestPrice, discount, customerId, description) {
        if (customerId) {
            return Quickbooks.createConferenceInvoice(email, total, conferencePrice, guestPrice, discount, customerId, description);
        }
        return q.reject('Unknown customer.');

    }

    //Takes invoiceInfo object(invoiceId, invoiceNumber,invoiceAmount)
    //Resolves new invoice record
    function createInvoiceRecord(invoiceInfo) {

        cleanup.qbInvoiceId = invoiceInfo.invoiceId;
        qbInvoiceId = invoiceInfo.invoiceId;

        var newInvoiceRecord = new Invoice({

            invoiceRef: invoiceInfo.invoiceId,
            invoiceNumber: invoiceInfo.invoiceNumber,
            type: "Conference Registration",
            memo: "Admission Fees for AAPP Conference.",
            amount: invoiceInfo.invoiceAmount,
            couponCode: mainCouponId,
            discount: record.discount
        });

        if(invoiceInfo.invoiceAmount <= 0){
            newInvoiceRecord.amount = 0;
            newInvoiceRecord.comped = true;
            newInvoiceRecord.paid = true;
        }

        cleanup.invoiceRecord = newInvoiceRecord._id;
        return newInvoiceRecord.save()

    }

    //Takes the QB invoiceRef from the invoice record, returns the QB payment.
    function payQBInvoice(invoiceId) {
        return Quickbooks.payInvoice(invoiceId);

    }

    //Takes payee info, invoice number, invoice amount, stripe transaction and quickbooks payment id.
    //Resolves payment object.
    function createPaymentRecord(firstName, lastName, address, invoiceNumber, invoiceAmount, transaction, qbPayment) {
        var newPayment = new Payment({
            firstName: firstName,
            lastName: lastName,
            address: address,
            invoiceNumbers: [invoiceNumber],
            amount: invoiceAmount,
            transaction: transaction,
            qbPayment: qbPayment
        });

        cleanup.payment = newPayment._id;

        return newPayment.save();
    }


    function checkVendorCoupon(couponCode) {
        return Coupon.findOne({ code: couponCode })
            .then(function (coupon) {
                if (!coupon) {
                    return null;
                }
                if (coupon.type != 'vendor') {
                    return null;
                }
                if (coupon.singleUse && coupon.uses > 0) {
                    return null;
                }

                if (new Date() > coupon.expiration) {
                    return null;
                }

                if(!coupon.uses){
                    coupon.uses = 1;
                }else{
                    coupon.uses = coupon.uses + 1;
                }
    
                mainCouponId = coupon._id;
                coupon.save();

                return coupon.discount;
            });
    }

    function checkCoupon(passedCouponId) {
        //only do this when a discount is present
        return Coupon.findById(passedCouponId)
        .then(function (coupon) {
            if (!coupon) {
                return q.reject("Could not validate coupon.");
            }
            if (coupon.singleUse && coupon.uses > 0) {
                return q.reject("Sorry. Your coupon has already been used.");
            }

            if (new Date() > coupon.expiration) {
                return q.reject("Sorry. Your coupon has expired.");
            }

            if(!coupon.uses){
                coupon.uses = 1;
            }else{
                coupon.uses = coupon.uses + 1;
            }

            mainCouponId = coupon._id;
            coupon.save();

            return coupon.discount;
        });
    }


}