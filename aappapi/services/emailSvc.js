const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY);
const q = require('q');
const pdf = require('./pdfCreator');

module.exports = {
    sendManualMemberEmail: ManualMemberEntry,
    sendGeneralEmail: SendGeneralEmail,
    sendApprovedEmail: SendApprovedEmail,
    sendRejectedEmail: SendRejectedEmail,
    sendPasswordLink: SendPasswordLink,
    notifyDev: NotifyDev,
    memberReminder: MemberReminder,
    certificateEmail: CertificateEmail
};

function ManualMemberEntry(user, password) {
    const htmlMessage = `
                    <p>Dear ${user.fullname},</p>
                    <p>We have significantly upgraded our website to a brand new web application!</p>
                    <p>The processes for registering for conferences, paying invoices and accessing information just got much easier.</p>
                    <p>As a current member, you can log in with your email address. Here is your temporary password:</p>
                    <p style="font-size: 20px;">${password}</p>
                    <p>Please log in within 48 hours, change your password, and update your address.</p>
                    <p>Thank you,</p>
                    <p>Board of Directors</p>
                    <p>AAPP</p>
                `;

    const text = `
                    Dear ${user.fullname},\n
                    We have significantly upgraded our website to a brand new web application!\n\n
                    The processes for registering for conferences, paying invoices and accessing information just got much easier.\n\n
                    As a current member, you can log in with your email address. Here is your temporary password:\n\n
                    PASS: ${password}\n\n
                    Please log in within 48 hours, change your password, and update your address.\n\n
                    Thank you,\n\n
                    Board of Directors\n
                    AAPP\n
                `;
    const html = '<html style="font-size: 16px">' +
        htmlMessage +
        '</html>';

    const msg = {
        to: user.email,
        from: { email: 'automated@americanassociationofpolicepolygraphists.org', name: 'AAPP' },
        subject: 'AAPP - New login credentials.',
        text: text,
        html: html
    };


    return sgMail.send(msg);

}

//EMAILS MUST BE IN FORMAT {email:'sample@sample.com', name: 'Sample Name'}
async function SendGeneralEmail(emails, message, subject, senderName) {
    if (!Array.isArray(emails)) {
        return;
    }
    emails.push({name:'Allison Hines',email:'nom@policepolygraph.org'});
    try {
        await asyncForEach(emails, async (obj) => {
            await wait(250);
            if (!obj.hasOwnProperty('email') || !obj.hasOwnProperty('name')) {
                return;
            }

            const htmlMessage = `<p>${message.replace(/\n+/g, '</p><p>')}</p><p>Sincerely,<br/> <span style="color:darkblue">${senderName}</style></p>`;

            const text = `Dear ${obj.name},\n\n${message}\n\nSincerely,\n${senderName}\n AAPP`;
            const html = '<html style="font-size: 18px">' +
                '<p>Dear ' + obj.name + ',</p>' +
                htmlMessage +
                '<p style="align:center;margin-top: 15px;padding-top:8px; border-top:1px solid gray; font-style:italic;">This is an automated email. Please do not reply. You may contact the national office by emailing <a href="mailto:nom@policepolygraph.org">nom@policepolygraph.org</a> or call 847-635-3980.</p>' +
                '</html>';

            const msg = {
                to: { email: obj.email, name: obj.name },
                from: { email: 'automated@americanassociationofpolicepolygraphists.org', name: 'AAPP' },
                subject: subject,
                text: text,
                html: html
            };

            if (process.env.NODE_ENV == 'development') {
                console.log(text);
                return;
            }

            try {
                await sgMail.send(msg);
            } catch (e) {
                console.log(e);
            }

        });
    } catch (e) {
        console.log(e);
    }
}



function NotifyDev(message) {

    const msg = {
        to: 'gregharkins@harcomtech.com',
        from: { email: 'automated@americanassociationofpolicepolygraphists.org', name: 'AAPP' },
        subject: 'AAPP Error',
        text: message,
    };
    sgMail.send(msg)
        .then(function (res) {

        })
        .catch(function (err) {
            console.error(err);
        });
}

function SendApprovedEmail(email, name, password, type) {

    var typeText;
    switch (type) {
        case 'conference':
            typeText = 'your conference registration.';
            break;
        case 'member':
            typeText = "your membership application. Your membership is CONDITIONAL at this time. If conditions are met, your membership will be granted by majority vote of the membership during the Annual Business Meeting. The meeting takes place during the yearly training conference, held in the Spring. We encourage you to attend. You can find more information about the conference by visiting www.americanassociationofpolicepolygraphists.org/conference.";
            break;
        case 'instructor':
            typeText = "you to be an instructor."
            break;
        case 'school':
            typeText = "you to be a school administrator.";
            break;
        default:
            return;
    }


    var passwordText = '';
    var passwordHtml = '';

    if (password) {
        passwordHtml = `
            <p>Your temporary password is:</p>
            <p style="font-size:20px">${password}</p>
        `;
        passwordText = `
        Your temporary password is: ${password}\n\n
    `;
    }



    const htmlMessage = `
                    <p>Dear ${name},</p>
                    <p>The AAPP Board of Directors has approved ${typeText}</p>
                    <p>You may access new resources on the <a href="https://www.americanassociationofpolicepolygraphists.org">AAPP Portal</a>.</p>` +
        passwordHtml +
        `
                    <p>Please log in within 48 hours, change your password, and update your address.</p>
                    <p>Thank you,</p>
                    <p>Board of Directors</p>
                `;

    const text = `
                Dear ${name},\n\n
                The AAPP Board of Directors has approved ${typeText}\n\n
                You may access new resources on the https://www.americanassociationofpolicepolygraphists.org.\n\n`  +
        passwordText +
        `
                Please log in within 48 hours, change your password, and update your address.\n\n
                Thank you,\n
                Board of Directors\n
                AAPP\n
                `;
    const html = '<html style="font-size: 16px">' +
        htmlMessage +
        '<p style="align:center;margin-top: 15px;padding-top:8px; border-top:1px solid gray; font-style:italic;">This is an automated email. Please do not reply. You may contact the national office by emailing <a href="mailto:nom@policepolygraph.org">nom@policepolygraph.org</a> or call 847-635-3980.</p>' +
        '</html>';

    const msg = {
        to: email,
        bcc: 'gregharkins@harcomtech.com',
        from: { email: 'automated@americanassociationofpolicepolygraphists.org', name: 'AAPP' },
        subject: 'AAPP - Approval.',
        text: text,
        html: html
    };

    if (process.env.NODE_ENV == 'development') {
        console.log("--------------");
        console.log("EMAIL");
        console.log(text);
        console.log("--------------");
        return;
    }
    sgMail.send(msg)
        .then(function (res) {

        })
        .catch(function (err) {
            console.error(err);
        });
}

function SendRejectedEmail(email, name, reason, type) {

    var typeText;
    switch (type) {
        case 'conference':
            typeText = 'Your conference registration request';
            break;
        case 'member':
            typeText = "Your membership application";
            break;
        default:
            return;
    }


    const htmlMessage = `
                    <p>Dear ${name},</p>
                    <p>${typeText} has been denied for the following reason:</p>
                    <p style="font-style:italic;">${reason}</p>
                    <p>Regretfully,</p>
                    <p>Board of Directors</p>
                `;

    const text = `
                Dear ${name},\n\n
                ${typeText} has been denied for the following reason:\n\n
                ${reason}\n\n
                Regretfully,\n\n
                Board of Directors\n\n
                AAPP\n\n
                `;
    const html = '<html style="font-size: 16px">' +
        htmlMessage +
        '<p style="align:center;margin-top: 15px;padding-top:8px; border-top:1px solid gray; font-style:italic;">This is an automated email. Please do not reply. You may contact the national office by emailing <a href="mailto:nom@policepolygraph.org">nom@policepolygraph.org</a> or call 847-635-3980.</p>' +
        '</html>';

    const msg = {
        to: email,
        bcc: 'gregharkins@harcomtech.com',
        from: { email: 'automated@americanassociationofpolicepolygraphists.org', name: 'AAPP' },
        subject: 'AAPP - Rejection.',
        text: text,
        html: html
    };

    if (process.env.NODE_ENV == 'development') {
        console.log("--------------");
        console.log("EMAIL");
        console.log(text);
        console.log("--------------");
        return;
    }

    sgMail.send(msg)
        .then(function (res) {

        })
        .catch(function (err) {
            console.error(err);
        });
}


function SendPasswordLink(email, link) {

    const htmlMessage = `
                    <p>You may reset your password here:</p>
                    <p><a href="${link}">${link}</a></p>
                    <p>This link will expire in 24 hours.</p>
                `;

    const text = `
    You may reset your password here:\n\n
    ${link}\n\n
    This link will expire in 24 hours.\n\n
                `;
    const html = '<html style="font-size: 16px">' +
        htmlMessage +
        '<p style="align:center;margin-top: 15px;padding-top:8px; border-top:1px solid gray; font-style:italic;">This is an automated email. Please do not reply. You may contact the national office by emailing <a href="mailto:nom@policepolygraph.org">nom@policepolygraph.org</a> or call 847-635-3980.</p>' +
        '</html>';

    const msg = {
        to: email,
        from: { email: 'automated@americanassociationofpolicepolygraphists.org', name: 'AAPP' },
        subject: 'Password Reset.',
        text: text,
        html: html
    };

    if (process.env.NODE_ENV == 'development') {
        console.log("--------------");
        console.log("EMAIL");
        console.log(text);
        console.log("--------------");
        return;
    }
    sgMail.send(msg)
        .then(function (res) {

        })
        .catch(function (err) {
            console.error(err);
        });

}

async function MemberReminder(emailObjects) {

    try {
        await asyncForEach(emailObjects, async (obj) => {
            await wait(250);

            const htmlMessage = `
        <p>Dear ${obj.name},</p>
        <p>We noticed that you still have not logged in to the new AAPP Website to update your information. It is important to do so in order to keep your membership current. If you are having difficulty please feel free to contact us for assistance.</p>
        <p>Pease take a few seconds to quickly update your address. Your login email is ${obj.email}. If you lost your temporary password you can set a new one by navigating to the website, clicking LOGIN, and then clicking Forgot My Password.</p>
        <p>Thank you,
        <br/>AAPP Board of Directors<p>
        `;

            const text = `Dear ${obj.name},\n\nWe noticed that you have not logged in to the new AAPP Website to update your information. If you are having difficulty please feel free to contact us for assistance.\n\nPease take this moment to quickly update your address. Your login email is ${obj.email}. If you lost your temporary password you can set a new one by navigating to the website, clicking LOGIN, and then clicking Forgot My Password.\n\n`;
            const html = '<html style="font-size: 18px">' +
                htmlMessage +
                '<p style="align:center;margin-top: 15px;padding-top:8px; border-top:1px solid gray; font-style:italic;">This is an automated email. Please do not reply. You may contact the national office by emailing <a href="mailto:nom@policepolygraph.org">nom@policepolygraph.org</a> or call 847-635-3980.</p>' +
                '</html>';

            const msg = {
                to: { email: obj.email, name: obj.name },
                from: { email: 'automated@americanassociationofpolicepolygraphists.org', name: 'AAPP' },
                subject: 'Reminder',
                text: text,
                html: html
            };

            if (process.env.NODE_ENV == 'development') {

                return;
            }

            try {
                await sgMail.send(msg);

            } catch (e) {
                console.log(e);
            }

        });
    } catch (e) {
        console.log(e);
    }

}

async function InvoiceReminder(emailObjects) {

    try {
        await asyncForEach(emailObjects, async (obj) => {
            await wait(250);

            const htmlMessage = `
        <p>Dear ${obj.name},</p>
        <p>Thank you,
        <br/>AAPP Board of Directors<p>
        `;

            const text = `Dear ${obj.name},`;
            const html = '<html style="font-size: 18px">' +
                htmlMessage +
                '</html>';

            const msg = {
                to: { email: obj.email, name: obj.name },
                from: { email: 'automated@americanassociationofpolicepolygraphists.org', name: 'AAPP' },
                subject: 'Reminder',
                text: text,
                html: html
            };

            if (process.env.NODE_ENV == 'development') {

                return;
            }

            try {
                await sgMail.send(msg);

            } catch (e) {
                console.log(e);
            }

        });
    } catch (e) {
        console.log(e);
    }

}

function CertificateEmail(payload) {
    pdf.generateCert(payload)
        .then(function (blob) {
            console.log("Sending cert email...");
            const message = `<p>${payload.name},</p><p>Thank you for your participation. Attached is your bluesheet and certificate of attendance.</p><p>AAPP</p>`;
            const base64data = blob.toString('base64');
            const msg = {
                to: payload.email,
                from: { email: 'automated@americanassociationofpolicepolygraphists.org', name: 'AAPP' },
                subject: 'Your bluesheet and certificate.',
                html: message,
                attachments: [
                    {
                        content: base64data,
                        filename: payload.name + ' AAPP Documents.pdf',
                        type: 'application/pdf',
                        disposition: 'attachment',
                        content_id: 'cert'
                    }
                ],
            };
            sgMail.send(msg)
                .then(function (res) {
                    console.log("Cert email sent.");
                })
                .catch(function (err) {
                    console.error(err);
                });


        })
        .catch(function (err) {
            console.error("CHECKOUT ERROR: ", err);
        });


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