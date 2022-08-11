const email = require('../../services/emailSvc');
const MembershipApplication = require('../../models/membershipApplication');
const User = require('../../models/user');
const moment = require('moment');
const EmailSvc = require('../../services/emailSvc');

module.exports = async function (done) {
    try {
        console.log('Checking the state of membership applications.');
        const admins = await User.find({ isAdmin: true, active: true });
        const applications = await MembershipApplication.find({ regionApproved: { $ne: true },rejected: { $ne: true } }).populate('user invoiceRef');
        const appsByRegion = {
            1: [], 2: [], 3: [], 4: [], 5: [], 6: []
        };
        applications.forEach(singleApp => {
            if (singleApp.invoiceRef.paid) {
                appsByRegion[singleApp.user.region].push({ name: `${singleApp.user.firstName} ${singleApp.user.lastName}`, email: singleApp.user.email, date: moment(singleApp.created_at).format('MM/DD/YYYY') });
            }
        });



        for (i = 1; i < 6; i++) {

            if (appsByRegion[i].length < 1) {
                continue;
            }
            const emails = admins.filter(admin => {
                if (admin.region == i && admin.groups.indexOf('regional-manager') > -1) {
                    return admin;
                }
            }).map(admin => {
                return { email: admin.email, name: `${admin.firstName} ${admin.lastName}` }
            });

            emails.push({ email: 'gregharkins@harcomtech.com', name: 'Greg Harkins' });
            emails.push({ email: 'adam.rembisz@newbritainct.gov', name: 'Adam Rembisz' });

            const subject = `Region ${i} Application Status`;
            var message = `The following paid applications are waiting for approval in Region ${i}:\n`;
            appsByRegion[i].forEach(app => {
                message = `${message}${app.name} - ${app.email} (Since ${app.date})\n`
            });

            if (process.env.NODE_ENV === 'development') {
                console.log(subject, message, emails);
            } else {
                EmailSvc.sendGeneralEmail(emails, message, subject, 'AAPP Automated Process')
                    .then(function () {
                        console.log('Application submitted - email sent.');
                    });
            }
        }

    } catch (e) {
        console.error(e);
    }

    done();


};
