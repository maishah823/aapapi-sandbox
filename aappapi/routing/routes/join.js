var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var FirstUseCode = require('../../models/firstUseCode');
var MembershipApplication = require('../../models/membershipApplication');
var validator = require('validator');
var ApiError = require('../../classes/ApiError');
var jwt = require('jsonwebtoken');
var StudentDiscount = require('../../models/studentdiscount');
var q = require('q');
var Guid = require('guid');
var moment = require('moment');
var Quickbooks = require('../../services/quickbooks');
var Redis = require('../../services/redisSvc');
var Invoice = require('../../models/invoice');
var Payment = require('../../models/payment');
var Credit = require('../../services/credit');

router.post('/check-email', (req, res) => {
    if (!req.body.email) {
        return res.json({});
    }
    if (typeof req.body.email != 'string') {
        return res.json({})
    }
    var emailInput = req.body.email.toLowerCase().trim();

    if (!validator.isEmail(emailInput)) {
        return res.json({});
    }

    var userPromise = User.findOne({ email: emailInput })
    var studentPromise = StudentDiscount.findOne({ email: emailInput });

    q.all([userPromise, studentPromise])
        .then(function (values) {
            const user = values[0];
            const student = values[1];
            console.log(user);
            var returnObj = {};
            if (user) {
                returnObj.found = true;
                returnObj.email = emailInput;
                if (user.isMember) {
                    returnObj.isMember = true;
                }
            }
            if (student) {
                returnObj.discount = true;
                returnObj.graduationDate = student.graduationDate;
                returnObj.school = student.school;
            }
            return res.json(returnObj);
        })
        .catch(function (err) {
            console.err(err);
            return res.status(500).send(new ApiError('Join', 'Error validating email.'));
        });

});

router.post('/authenticate', (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send(new ApiError('Authenticate', 'Improper Credentials.'));
    }

    var emailInput = req.body.email.toLowerCase();

    if (!validator.isEmail(emailInput)) {
        return res.status(400).send(new ApiError('Authenticate', 'Malformed Email.'));
    }

    //find the user
    User.findOne({
        email: emailInput
    }, function (err, user) {
        if (err) {
            return res.status(500).send(new ApiError('Authenticate', 'Error processing request.'));
        }
        if (!user) {
            return res.status(400).send(new ApiError('Authenticate', 'Incorrect Credentials'));

        } else {

            if (!user.active) {
                return res.status(403).send(new ApiError('Authenticate', 'User not active.'));
            }

            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    var userObject = {
                        _id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        address: user.address
                    };
                    if (user.isMember) {
                        userObject.isMember = true;
                    }
                    var token = jwt.sign({ email: user.email }, process.env.JOIN_TOKEN_SECRET, { expiresIn: '10y' });
                    userObject.token = token;
                    res.json(userObject);
                } else {
                    return res.status(400).send(new ApiError('Authenticate', 'Incorrect Credentials'));
                }
            });

        }
    }).select("+password");
});


router.post('/submitApplication', (req, res) => {
    //Save the IDs of any generated records so they can be deleted if any part of the process fails.
    var records = {};

    if (!req.body.application || !req.body.application.email || !req.body.application.address) {
        return res.status(400).send(new ApiError('Application', 'Something went wrong!'));
    }

    const application = req.body.application;

    application.email = application.email.toLowerCase();

    if (!validator.isEmail(application.email)) {
        return res.status(400).send(new ApiError('Authenticate', 'Malformed Email.'));
    }

    return User.findOne({ email: application.email })
        .then(function (user) {
            if (user) {

                if (user.isMember) {
                    return res.status(400).send(new ApiError('Application', 'Membership application already submitted.'));
                }
                if (!application.token) {
                    return res.status(400).send(new ApiError('Application', 'Error using this email!'));
                }
                return jwt.verify(application.token, process.env.JOIN_TOKEN_SECRET, function (err, decoded) {
                    if (err) {
                        return res.status(400).send(new ApiError('Application', 'Error authenticating user.'));
                    }
                    if (decoded.email != application.email) {
                        return res.status(400).send(new ApiError('Application', 'You do not have permission to use this email.'));
                    }

                    application.customerId = user.customerId;
                    application.user = user._id;

                    if (!application.address) {
                        return res.status(400).send(new ApiError('Application', 'An address is required.'));
                    }

                    user.address = application.address;

                    //START FLOW
                    console.log("PROCESSING MEMBER APPLICATION FOR EXISTING USER");
                    return user.save()
                        .then(createCustomer)
                        .then(function (customerId) {
                            if (application.customerId != customerId) {
                                application.customerId = customerId;
                                return User.findByIdAndUpdate(application.user, { customerId: customerId })
                            }
                        })
                        .then(processApplication)
                        .then(function () {
                            Redis.writeToLog('Member App', `${application.firstName} ${application.lastName} submitted a membership application.`);
                            if (application.invoiceId) {
                                Quickbooks.emailInvoice(application.invoiceId);
                            }
                            if (records.payment) {
                                Redis.sendToWorker('syncInvoicesToPayment', records.payment);
                                Redis.sendToWorker('applicationSubmitted', {email:application.email,name:`${application.firstName} ${application.lastName}`});
                            }
                            return res.json({ complete: true });
                        })
                        .catch(function (err) {
                            if (records.application) {
                                console.log("DELETING APPLICATION: ", records.application);
                                MembershipApplication.findByIdAndRemove(records.application)
                                    .then(function () {
                                        console.log("APPLICATION DELETED");
                                    })
                                    .catch(function (err) {
                                        console.log("ERROR DELETING APPLICATION: ", err);
                                    });

                            }
                            if (records.invoice) {
                                Invoice.findByIdAndRemove(records.invoice)
                                    .then(function () {
                                        console.log("INVOICE RECORD DELETED");
                                    })
                                    .catch(function (err) {
                                        console.log("ERROR DELETING INVOICE RECORD: ", err);
                                    });
                            }
                            if (records.payment) {
                                Payment.findByIdAndRemove(records.payment)
                                    .then(function () {
                                        console.log("PAYMENT RECORD DELETED");
                                    })
                                    .catch(function (err) {
                                        console.log("ERROR DELETING PAYMENT RECORD: ", err);
                                    });
                            }
                            if (application.invoiceId) {
                                Quickbooks.deleteInvoice(application.invoiceId);
                            }
                            if (application.paymentId) {
                                Quickbooks.deletePayment(application.paymentId);
                            }
                            if (typeof err != 'string') {
                                return res.status(500).send(new ApiError('Application', 'An unknown error occured while processing your application. Please try again later.'));
                            }
                            console.error("NOTICE TO CLIENT: ", err);
                            return res.status(500).send(new ApiError('Application', err));
                        });
                });

            } else {
                console.log("PROCESSING MEMBER APPLICATION FOR NEW USER");
                createCustomer()   // creating customer for first time
                    .then(createUser)
                    .then(processApplication)
                    .then(function (user) {
                        Redis.writeToLog('Member App', `${application.firstName} ${application.lastName} submitted a membership application.`);
                        if (application.invoiceId) {
                            Quickbooks.emailInvoice(application.invoiceId);
                        }
                        if (records.payment) {
                            Redis.sendToWorker('syncInvoicesToPayment', records.payment);
                            Redis.sendToWorker('applicationSubmitted', {email:application.email,name:`${application.firstName} ${application.lastName}`});
                        }
                        return res.json({ complete: true })
                    })
                    .catch(function (err) {
                        //Clean UP if there is a failure...
                        if (records.user) {
                            User.findByIdAndRemove(records.user)
                                .then(function (u) {
                                    Redis.client.srem("used-emails", u.email || 'unknown');
                                    console.log("USER DELETED");
                                })
                                .catch(function (err) {
                                    console.log("ERROR DELETING USER: ", err);
                                });
                        }
                        if (records.application) {
                            MembershipApplication.findByIdAndRemove(records.application)
                                .then(function () {
                                    console.log("APPLICATION DELETED");
                                })
                                .catch(function (err) {
                                    console.log("ERROR DELETING APPLICATION: ", err);
                                });
                        }
                        if (records.invoice) {
                            Invoice.findByIdAndRemove(records.invoice)
                                .then(function () {
                                    console.log("INVOICE RECORD DELETED");
                                })
                                .catch(function (err) {
                                    console.log("ERROR DELETING INVOICE RECORD: ", err);
                                });
                        }
                        if (records.payment) {
                            Payment.findByIdAndRemove(records.payment)
                                .then(function () {
                                    console.log("PAYMENT RECORD DELETED");
                                })
                                .catch(function (err) {
                                    console.log("ERROR DELETING PAYMENT RECORD: ", err);
                                });
                        }
                        if (application.invoiceId) {
                            Quickbooks.deleteInvoice(application.invoiceId);
                        }
                        if (application.paymentId) {
                            Quickbooks.deletePayment(application.paymentId);
                        }
                        if (typeof err != 'string') {
                            return res.status(500).send(new ApiError('Application', 'An unknown error occured while processing your application. Please try again later.'));
                        }
                        console.error("NOTICE TO CLIENT: ", err);
                        return res.status(500).send(new ApiError('Application', err));
                    });
            }
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Application', 'Something went wrong!'));
        });

    function createCustomer() {
        return Quickbooks.createCustomer(application.title, application.firstName, application.middleName, application.lastName, application.address, application.email, application.cellPhone);
    }

    function createUser(customerId) {
        application.customerId = customerId;
        var newUser = new User({
            email: application.email,
            firstName: application.firstName,
            middleName: application.middleName,
            lastName: application.lastName,
            address: application.address,
            customerId: customerId,
            passwordIsTemp: true,
            password: Guid.raw(),
            needsCreds: true
        });
        return newUser.save()
            .then(function (user) {
                //Keep this ID
                records.user = user._id;
                application.user = user._id;
                var firstUseCode = new FirstUseCode({
                    code: Guid.raw(),
                    expiration: moment().add(2, 'days').toDate(),
                    user: user._id
                });
                return firstUseCode.save()
                    .then(function (code) {

                        return "USER CREATED"
                    });
            })
            .catch(function (err) { console.error(err) });
    }



    function processApplication() {
        return processPayment()
            .then(createMemberApplication)
            .then(createInvoice)
            .then(createInvoiceRecord)
            .then(payInvoice)
            .then(createPaymentRecord);

    }

    function processPayment() {
        if (application.paymentType == 'credit') {
            return Credit.payInitialMembershipWithCard(calculateTotal(), application.cc, application.expMonth, application.expYear, application.cvv, `${application.firstName} ${application.lastName}`, application.email, application.address)
                .then(function (transaction) {
                    if (transaction) {
                        application.paid = true;
                        application.paidOn = new Date();
                        application.transaction = transaction;
                        return q.resolve(true);
                    } else {
                        return q.reject("Could not process payment. Please check your card information.");
                    }
                })
                .catch(function (err) {
                    console.error(err);
                    return q.reject(err);
                });
        } else {
            return q.resolve();
        }

    }

    function createMemberApplication() {
        if (application.school == 'other') {
            application.school = null;
        }
        //Determine the type of membership based on the input graduationDate, memberClass,examsConducted, 
        if (application.address && application.address.country != 'United States') {
            application.memberClass = 'foreign';
        } else if(application.memberClass = 'intern'){
            application.memberClass='active';
            // var sixMonthsAfterGrad = moment(application.graduationDate).add(6, 'months').toDate();
            // if (!application.examsConducted || application.examsConducted < 50 || !application.graduationDate || new Date() < sixMonthsAfterGrad) {
            //     application.memberClass = 'intern';
            // }
        }



        var memberApplication = new MembershipApplication(application);
        return memberApplication.save()
            .then(function (application) {
                records.application = application._id;
                return application._id;
            })
            .catch(function (err) {
                console.error(err);
                if (err.code == 11000) {
                    return q.reject("A member application has already been submitted. Contact the National Office Manager to check on your application.");
                }
                return q.reject("Could not process application.")
            });
    }

    function createInvoice() {
        let amount = 125;

        /**
         *  support invoice for delinquent dues/inactive users
         * @private
         */
        let _user = User.findById(application._id);  // get user by id
        // check if user is inactive or having deliquent dues then send fee as non member seminar fee $595
        if (_user.active ===false || user.isDelinquentDues) {
            amount = 595;
        }

        let description = "Yearly membership dues (United States)."
        if (application.address.country != 'United States') {
            amount = 150;
            description = "Yearly membership dues (Foreign)."
        }
        return Quickbooks.createMembershipInvoice(application.email, amount, "Membership", description, application.customerId, application.hasSchoolDiscount);
    }

    function createInvoiceRecord(invoiceInfo) {
        application.invoiceId = invoiceInfo.invoiceId;
        application.invoiceNumber = invoiceInfo.invoiceNumber;
        application.invoiceAmount = invoiceInfo.invoiceAmount;
        var newInvoiceRecord = new Invoice({
            user: application.user,
            invoiceRef: invoiceInfo.invoiceId,
            invoiceNumber: invoiceInfo.invoiceNumber,
            type: "Membership Dues",
            memo: "Initial application and membership dues prior to application process.",
            amount: invoiceInfo.invoiceAmount
        });
        return newInvoiceRecord.save()
            .then(function (invoice) {
                records.invoice = invoice._id;
                return MembershipApplication.findByIdAndUpdate(records.application, { invoiceRef: invoice });
            })
            .catch(function (err) {
                console.error(err);
                return q.reject("Server error prevented processing of application.");
            });

    }

    function payInvoice() {
        if (application.paid) {
            return Quickbooks.payInvoice(application.invoiceId);
        } else {
            return q.resolve(false);
        }
    }

    function createPaymentRecord() {
        if (!application.paid) {
            return q.resolve();
        }
        //application.paymentId = paymentId;

        var newPayment = new Payment({
            firstName: application.firstName,
            lastName: application.lastName,
            address: application.address,
            invoiceNumbers: [application.invoiceNumber],
            amount: application.invoiceAmount,
            transaction: application.transaction
        });

        return newPayment.save()
            .then(function (payment) {
                records.payment = payment._id;
                return q.resolve();
            })
            .catch(function (err) {
                console.error(err);
                return q.reject("Could not complete application.")
            });
    }

    function calculateTotal() {
        var total = 125;
        if (application.address.country != "United States") {
            total = 150;
        }
        if (application.hasSchoolDiscount) {
            total = total / 2;
        }
        return total + 25;
    }


});

module.exports = router;
