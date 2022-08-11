var Email = require('../../services/emailSvc');
const Student = require('../../models/studentdiscount');
const School = require('../../models/school');
const User = require('../../models/user');
const moment = require('moment');

module.exports = {
    newSchoolAdmin: NewSchoolAdmin,
    newAttendee: NewAttendee,
    newAdmin: NewAdmin,
    newStudent: NewStudent,
    newMember: NewMember,
    newInstructor: NewInstructor,
    passwordReset: PasswordReset,
    rejectMember: RejectMember,
    rejectAttendee: RejectAttendee,
    applicationSubmitted: ApplicationSubmitted,
    notifyAdminOfApplication: NotifyAdminOfApplication,
    notifySecretaryOfApproval: NotifySecretaryOfApproval,
    sendCertificate: SendCertificate
};


//-----------------------------
//TODO: Add Email Functionality
//-----------------------------

function NewMember(payload, done) {
    if (payload) {
        const email = payload.email;
        const name = payload.name;
        const password = payload.password;

        Email.sendApprovedEmail(email, name, password, 'member');
    }


    done();
}

function NewSchoolAdmin(payload, done) {

    if (payload) {
        const email = payload.email;
        const name = payload.name;
        const password = payload.password;

        Email.sendApprovedEmail(email, name, password, 'school');
    }


    done();
}

function NewAttendee(payload, done) {
    if (payload) {
        const email = payload.email;
        const name = payload.name;
        const password = payload.password;

        Email.sendApprovedEmail(email, name, password, 'conference');
    }


    done();
}

function NewAdmin(payload, done) {
    if (process.env.NODE_ENV === 'development') {
        console.log("---------------------");
        console.log("NEW ADMIN EMAIL");
        console.log(JSON.stringify(payload));
        console.log("---------------------");

    }


    done();
}

function NewInstructor(payload, done) {
    if (payload) {
        const email = payload.email;
        const name = payload.name;
        const password = payload.password;

        Email.sendApprovedEmail(email, name, password, 'instructor');
    }


    done();
}

function NewStudent(payload, done) {

    Student.findById(payload).populate('school')
        .then(function (student) {
            if (student) {
                const subject = `${student.school.name} Graduation - AAPP`;
                const message = `Dear ${student.firstName},\nCongratulations!\n${student.school.name} has submitted your name as being eligible to apply for membership in the AAPP. To begin your application, simply visit htts://www.americanassociationofpolicepolygraphists.org and choose JOIN AAPP from the menu.\nBe sure to use the email on file (${student.email}) to automatically recieve the Preferred Graduate discount!\nVisit our website to check out the many benefits of joining the #1 Polygraph Organization in the United States. We look forward to having you.`;
                if (process.env.NODE_ENV !== 'development') {
                    Email.sendGeneralEmail([{ email: student.email, name: `${student.firstName} ${student.lastName}` }], message, subject, 'AAPP Board of Directors');
                } else {
                    console.log(message);
                }
            }
            done();
        })
        .catch(function (err) {
            console.error(err);
        });



}



function PasswordReset(payload, done) {
    if (payload) {
        const email = payload.email;
        const link = payload.link;

        Email.sendPasswordLink(email, link);
    }
    done();
}

function RejectMember(payload, done) {
    if (payload) {
        const email = payload.email;
        const name = payload.name;
        const reason = payload.reason;

        Email.sendRejectedEmail(email, name, reason, 'member');
    }


    done();
}

function RejectAttendee(payload, done) {
    if (payload) {
        const email = payload.email;
        const name = payload.name;
        const reason = payload.reason;

        Email.sendRejectedEmail(email, name, reason, 'conference');
    }


    done();
}

function ApplicationSubmitted(payload, done) {
    if (payload) {
        const email = payload.email;
        const name = payload.name;

        const msg = `Thank you for your application. Please be aware that the background check will not be conducted until your invoice is paid.\n
        You, or your agency, can pay your invoice at https://www.americanassociationofpolicepolygraphists.org/pay\nIf you have any questions or concerns you may contact our national office at 847-635-3980.`;

        Email.sendGeneralEmail([{ email: email, name: name }], msg, 'Application Submitted.', 'AAPP Board of Directors');

        //Lookup the account
        User.findOne({ email: email })
            .then(function (applicant) {
                NotifyAdminOfApplication(applicant, () => { console.log("All admin notified.") });
            })
            .catch(function (err) {
                console.error(err);
                console.error("Could not send notification of application to regional directors.");
            });

    }


    done();
}

function NotifyAdminOfApplication(applicant, done) {

    User.find({ isAdmin: true, active: true })
        .then(function (users) {
            const name = `${applicant.firstName} ${applicant.lastName}`;
            const subject = `Region ${applicant.region} Application Submitted.`;
            const message = `${name} has submitted a membership application.`;
            const emails = users.map(user => {
                if (user.region == applicant.region) {
                    return { email: user.email, name: user.fullname };
                }
                return null;
            }).filter(address=>address);
            if (emails.length < 1) {
                done();
                return;
            }
            if (process.env.NODE_ENV === 'development') {
                console.log(name, subject, message, emails);
            } else {
                EmailSvc.sendGeneralEmail([...emails,{name:'Cory Russell',email:'crussell@adaweb.net'}], message, subject, 'AAPP Automated Process')
                    .then(function () {
                        console.log('Application submitted - email sent.');
                    });
            }

        });

    done();
}

function NotifySecretaryOfApproval(payload, done) {
    const date = moment().format('MM/DD/YYYY')
    const subject = 'Application Approval';
    const message = `The application submitted by ${payload} has been approved by the Vice President on ${date}`;
    if (process.env.NODE_ENV !== 'development') {
        Email.sendGeneralEmail([{ email: 'aappsecretary@gmail.com', name: 'Robert Heard' }, { email: 'nom@policepolygraph.org', name: 'Amanda Reece' }, { email: 'adam.rembisz@newbritainct.gov', name: 'Adam Rembisz' }, { email: 'gregharkins@harcomtech.com', name: 'Greg Harkins' }], message, subject, 'AAPP Automated Process');
    } else {
        console.log(message);
    }

    done();
}

function SendCertificate(payload,done){
     Email.certificateEmail(payload);
     done();
}