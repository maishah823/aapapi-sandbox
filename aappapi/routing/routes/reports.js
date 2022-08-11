var express = require('express');
var router = express.Router();
var adminGuard = require('../../guards/admin.guard');
var MembershipApplication = require('../../models/membershipApplication');
var Attendee = require('../../models/attendeeInfo');
var User = require('../../models/user');
var Rep = require('../../models/representative');
var Invoice = require('../../models/invoice');
var School = require('../../models/school');
var Guest = require('../../models/guest');
var Student = require('../../models/studentdiscount');
var ApiError = require('../../classes/ApiError');
var moment = require('moment');
var json2xls = require('json2xls');
var Download = require('../../models/download');
var Conference = require('../../models/conference');


router.use(adminGuard);
router.get('/download-logs', (req, res) => {
    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var query = {};
    return Download.paginate(query, { page: page, limit: limit, sort: { 'created_at': -1 }, populate: [{ path: 'user', select: 'firstName lastName fullname' }] })
        .then(function (logs) {
            return res.json(logs);
        })
        .catch(function (err) {
            return res.status(400).send(new ApiError('Data Error', 'Could not retrieve logs.'));
        });
});
router.use(json2xls.middleware);
router.get('/data', async (req, res) => {
    var response = [];
    var type = 'Unknown';
    if (!req.query.type) {
        return res.json(response);
    }
    try {
        switch (req.query.type) {
            case 'confreg':
                type = 'Conference Registrations';
                response = await getConfReg();
                break;
            case 'members':
                type = 'Members';
                response = await getMembers();
                break;
            case 'invoices':
                type = 'Invoices';
                response = await getInvoices();
                break;
            case 'schools':
                type = 'Schools';
                response = await getSchools();
                break;
            case 'newstudents':
                type = 'Students';
                response = await getUnredeemedStudents();
                break;
            case 'guests':
                type = 'Conf Guests';
                response = await getConfGuests();
                break;
            case 'vendors':
                type = 'Conf Vendors';
                response = await getConfVendors();
                break;
            case 'applicants':
                type = 'Applicants';
                response = await getApplicants();
                break;
            case 'conditionalapplications':
                type = 'Conditional Applications';
                response = await getConditionalApplications();
                break;
        }
        res.xls('data.xls', response);
        if (!req.decoded.isDeveloper) {
            new Download({ user: req.decoded._id, type: type }).save();
        }

    } catch (err) {
        console.error(err);
        return res.status(400).send(new ApiError('Data Error', 'Could not retrieve data.'));
    }



});

function getConditionalApplications() {
    return Conference.findOne({ $and: [{ startDateTime: { $lt: new Date() } }, { startDateTime: { $gt: moment().subtract(1, 'year').subtract(1, 'month').toDate() } }] })
        .then(function (conf) {
            let meetingDate = moment(conf.startDateTime).add(2, 'days').toDate();
            return MembershipApplication.find({ finalApprovedOn: { $gte: meetingDate } })
                .populate('user')
                .sort([['finalApprovedOn', 1]])
                .then(function (applications) {
                    return applications.map(application => {
                        const finalApprovedOn = application.finalApproved ? moment(application.finalApprovedOn).format('MM/DD/YYYY') : '';
                        const regionApprovedOn = application.regionApprovedOn ? moment(application.regionApprovedOn).format('MM/DD/YYYY') : '';
                        const structuredData = {
                            "First Name": application.user.firstName || "",
                            "Last Name": application.user.lastName || "",
                            "Email": application.user.email || "",
                            "Submitted": moment(application.created_at).format('MM/DD/YYYY') || "",
                            "Final Approval": finalApprovedOn || "",
                            "Region Approval": regionApprovedOn || ""
                        };
                    
                        return structuredData;
                    });
                })
        });
}

function getConfReg() {
    return Attendee.find().populate([
        { path: 'user', select: '-password' },
        { path: 'conference', select: 'city state' },
        { path: 'invoiceRef', populate: [{ path: 'payment' }] },
        { path: 'guests' },
        { path: 'events' }
    ])
        .then(function (attendees) {
            return attendees.map(attendee => {
                var status = "Pending";
                if (attendee.rejected) {
                    status = "Rejected";
                } else if (attendee.finalApproved) {
                    status = "Approved"
                }

                if (!attendee.user) {
                    attendee.user = {};
                }
                var numOfGuests = attendee.guests ? attendee.guests.length : 0;
                var numOfEvents = attendee.events ? attendee.events.length : 0;
                var memberNumber = attendee.user.memberNumber || 'Non-Member';
                var address = attendee.user.address || {};
                var checkedIn = "";
                var checkedOut = "";
                if (attendee.checkedInAt) {
                    checkedIn = moment(attendee.checkedInAt).format('YYYY/MM/DD');
                }
                if (attendee.user.checkedOutOn) {
                    checkedOut = moment(attendee.user.checkedOutOn).format('YYYY/MM/DD');
                }
                return {
                    "First Name": attendee.user.firstName,
                    "Last Name": attendee.user.lastName,
                    "Email": attendee.user.email,
                    "Member #": memberNumber,
                    "Region": attendee.user.region || 'Unknown',
                    "City": address.city,
                    "State": address.state,
                    "Conference": `${attendee.conference.city}, ${attendee.conference.state}`,
                    "Registration Date": moment(attendee.created_at).format('YYYY/MM/DD'),
                    "Status": status,
                    "Checked In": checkedIn,
                    "Checked Out": checkedOut,
                    "Invoice": attendee.invoiceRef.invoiceNumber,
                    "Paid": attendee.invoiceRef.paid ? 'Yes' : 'No',
                    "Guests": numOfGuests,
                    "Events": numOfEvents,
                    "Description": attendee.orderDescription,

                }
            })
        })
        .catch(function (err) {
            console.error(err);
            throw new Error(err);
        })
}

function getMembers() {
    return User.find({ isMember: true }).select('-password')
        .then(function (users) {
            return users.map(user => {

                var address = user.address || {};
                var street = address.street1 || '';
                street = address.street2 ? street + " " + address.street2 : street;
                var level = user.memberLevel ? user.memberLevel.toUpperCase() : 'N/A';
                var memberNumber = user.memberNumber || 'Non-Member';
                return {
                    "First Name": user.firstName,
                    "Last Name": user.lastName,
                    "Email": user.email,
                    "Member #": memberNumber,
                    "Member Level": level,
                    "Region": user.region == 6 ? '' : user.region,
                    "Street": street,
                    "City": address.city || "",
                    "State": address.state || "",
                    "Zip": address.zip || "",
                    "Cell": address.cellPhone || "",
                    "Work": address.workPhone || "",

                }
            })
        })
        .catch(function (err) {
            console.error(err);
            throw new Error(err);
        });
}

function getInvoices() {
    return Invoice.find().populate('user payment couponCode')
        .then(function (invoices) {
            return invoices.map(invoice => {

                var user = invoice.user || {};
                var userAddress = user.address || {};
                var userStreet = userAddress.street1 ? userAddress.street1 + ', ' : '';
                var userCity = userAddress.city ? userAddress.city + ', ' : '';
                var userState = userAddress.state ? userAddress.state + ' ' : '';
                var userZip = userAddress.zip || '';

                var payment = invoice.payment || {};
                var paidBy = payment.companyName ? payment.companyName : (payment.firstName || '') + ' ' + (payment.lastName || '');
                var paymentAddress = payment.address || {};
                var paymentStreet = paymentAddress.street1 ? paymentAddress.street1 + ', ' : '';
                var paymentCity = paymentAddress.city ? paymentAddress.city + ', ' : '';
                var paymentState = paymentAddress.state ? paymentAddress.state + ' ' : '';
                var paymentZip = paymentAddress.zip || '';

                var coupon = invoice.couponCode || {};
                var invoiceDate = moment(invoice.created_at).format('YYYY/MM/DD');
                var paymentDate = payment.created_at ? moment(payment.created_at).format('YYYY/MM/DD') : '';

                return {
                    "Invoice Number": invoice.invoiceNumber,
                    "Amount": invoice.amount,
                    "Paid": invoice.paid ? 'YES' : 'NO',
                    "Invoice Date": invoiceDate,
                    "Payment Date": paymentDate,
                    "For": user.fullname,
                    "Address": userStreet + userCity + userState + userZip,
                    "Paid By": paidBy,
                    "Payment Address": paymentStreet + paymentCity + paymentState + paymentZip,
                    "Coupon Code": coupon.code,
                    "Type": invoice.type,
                    "Memo": invoice.memo
                }
            })
        })
        .catch(function (err) {
            console.error(err);
            throw new Error(err);
        });
}

function getSchools() {
    return School.find()
        .then(function (schools) {
            return schools.map(school => {

                var address = school.address || {};
                var street = address.street ? address.street + ', ' : '';
                var city = address.city ? address.city + ', ' : '';
                var state = address.state ? address.state + ' ' : '';
                var zip = address.zip || '';

                var addedOn = moment(school.created_at).format('YYYY/MM/DD');

                return {
                    "Name": school.name,
                    "Address": street + city + state + zip,
                    "Director": school.director,
                    "Phone": school.phone,
                    "Status": school.active ? 'Active' : 'Suspended',
                    "Added": addedOn
                }
            })
        })
        .catch(function (err) {
            console.error(err);
            throw new Error(err);
        });
}

function getUnredeemedStudents() {
    return Student.find({ redeemed: { $ne: true } }).populate('school')
        .then(function (students) {
            return students.map(student => {

                var school = student.school || {};
                var schoolName = school.name || ""
                var addedOn = moment(student.created_at).format('YYYY/MM/DD');
                var graduated = moment(student.graduationDate).format('YYYY/MM/DD');

                return {
                    "Last Name": student.lastName,
                    "First Name": student.firstName,
                    "Email": student.email,
                    "Graduation": graduated,
                    "School": schoolName,
                    "Added": addedOn
                }
            })
        })
        .catch(function (err) {
            console.error(err);
            throw new Error(err);
        });
}

function getConfGuests() {
    return Guest.find().populate('conference events')
        .then(function (guests) {
            return guests.map(guest => {
                var conference = guest.conference || {};
                var events = '';
                if (guest.all) {
                    events = "All Events";
                } else if (guest.events.length > 0) {
                    guest.events.forEach(singleEvent => {
                        events = events + " - " + singleEvent.name;
                    });
                }
                var addedOn = moment(guest.created_at).format('YYYY/MM/DD');



                return {
                    "Name": guest.name,
                    "Conference": `${conference.city}, ${conference.state}`,
                    "Events": events,
                    "Registered": addedOn
                }
            })
        })
        .catch(function (err) {
            console.error(err);
            throw new Error(err);
        });
}

function getConfVendors() {
    return Rep.find({ finalApproved: true }).populate('conference')
        .then(function (reps) {
            return reps.map(rep => {
                var conference = rep.conference || {};
                var addedOn = moment(rep.created_at).format('YYYY/MM/DD');
                var address = rep.address || {};


                return {
                    "Name": rep.firstName + ' ' + rep.lastName,
                    "Conference": `${conference.city}, ${conference.state}`,
                    "Email": rep.email,
                    "Company": rep.company,
                    "City": address.city,
                    "State": address.state,
                    "Registered": addedOn
                }
            })
        })
        .catch(function (err) {
            console.error(err);
            throw new Error(err);
        });
}
// user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique:true },
// citizen: Boolean,
// isLicensed: Boolean,
// licenseNumber: String,
// licenseList: String,
// school: { type: Schema.Types.ObjectId, ref: 'School' },
// schoolName: String,
// internSup: String,
// schoolDirector: String,
// schoolStreet: String,
// schoolCity: String,
// schoolState: String,
// schoolZip: String,
// schoolPhone: String,
// graduationDate: Date,
// memberClass: String,
// yearsExperience: Number,
// examsConducted: Number,
// techniques: String,
// otherOrgs: String,
// beenDienied: Boolean,
// denialExplaination: String,
// employmentStatus: String,
// employmentAddress: {
//     street1: String,
//     street2: String,
//     city: String,
//     state: String,
//     zip: String,
//     country: String,
//     workPhone: String
// },
// employmentAgency: String,
// supervisorName: String,
// supervisorPhone: String,
// supervisorEmail: String,
// hireDate: Date,
// seperationDate: Date,
// sperationType: String,
// convicted: Boolean,
// dischargedGov: Boolean,
// dischargedOrg: Boolean,
// ref1: {
//     name: String,
//     agency: String,
//     email: String,
//     phone: String
// },
// ref2: {
//     name: String,
//     agency: String,
//     email: String,
//     phone: String
// },
// ref3: {
//     name: String,
//     agency: String,
//     email: String,
//     phone: String
// },

// invoiceRef: { type: Schema.Types.ObjectId, ref: 'Invoice' },

// hasSchoolDiscount: Boolean,
// paymentType: String,
// // paid:Boolean,
// // paidOn:Date,

// regionApproved:Boolean,
// regionApprovedOn:Date,
// regionApprovedBy: { type: Schema.Types.ObjectId, ref: 'User'},

// finalApproved:Boolean,
// finalApprovedOn:Date,
// finalApprovedBy: { type: Schema.Types.ObjectId, ref: 'User'},

// rejected:Boolean,
// rejectedOn:Date,
// rejectedBy: { type: Schema.Types.ObjectId, ref: 'User'},
// rejectedReason:String,

// created_at: Date,
// updated_at: Date,
function getApplicants() {
    return MembershipApplication.find().populate('user invoiceRef')
        .then(function (applications) {
            return applications.map(application => {

                var paid = application.invoiceRef.paid ? 'YES' : 'NO';
                var addedOn = moment(application.created_at).format('YYYY/MM/DD');
                var status = "Pending";
                if (application.finalApproved) {
                    status = "Approved";
                } else if (application.rejected) {
                    status = "Rejected"
                }


                return {
                    "First Name": application.user.firstName || "",
                    "Last Name": application.user.lastName || "",
                    "Member Number": application.user.memberNumber || "",
                    "Applied On": addedOn,
                    "Status": status,
                    "Paid": paid,
                    "Invoice": application.invoiceRef.invoiceNumber || ""

                }
            })
        })
        .catch(function (err) {
            console.error(err);
            throw new Error(err);
        });
}


// router.get('/applications', (req, res) => { });

// router.get('/registrations', (req, res) => {
//     Attendee.find().populate('user conference invoiceRef')
//         .then(async function (attendees) {
//             console.log("Generating Registration Report...");
//             const report = await xl.generateRegistrationReport(attendees);
//             console.log(report);
//             res.status(200).send(report);
//         })
//         .catch(function (err) {
//             console.error(err);
//             return res.status(400).send(new ApiError('Reports', 'Could not generate report.'));
//         });
// });

module.exports = router;