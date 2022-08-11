const User = require('../../models/user');
const Invoice = require('../../models/invoice');
const Conference = require('../../models/conference');
const MembershipApplication = require('../../models/membershipApplication');
const q = require('q');
const Quickbooks = require('../../services/quickbooks');
const moment = require('moment');
const fs = require('fs');

module.exports = function (done) {
    console.log("GENERATE YEARLY DUES STARTED");
    if (process.env.NODE_ENV == 'development') {
        generateYearlyDuesInvoicesDev();

    } else {
        generateYearlyDuesInvoices();
    }
    done();
}

async function generateYearlyDuesInvoices() {

    let users = await User.find();
    let conditionals = await conditionalApplicationsList();
    await asyncForEach(users, async user => {
        await wait(500);
        let excluded = exclude(user,conditionals);
        if (excluded) {
            return;
        }
        let lineItem = generateLineItem(user);
        if (!lineItem) {
            return;
        }
        try {
            let result = await Quickbooks.createDuesInvoice(user.email, lineItem.amount, 'Membership', lineItem.description, user.customerId);
            //Save Invoice Record
            let invoice = new Invoice({
                user: user._id,
                invoiceRef: result.invoiceId,
                invoiceNumber: result.invoiceNumber,
                type: 'Membership Dues',
                memo: lineItem.description,
                amount: lineItem.amount
            });
            await invoice.save();
            Quickbooks.emailInvoice(result.invoiceId);
        } catch (e) {
            console.error(e);
        }


    });
    console.log("Done processing yearly invoices.");

}

async function generateYearlyDuesInvoicesDev() {
    const writeStream = fs.createWriteStream(__dirname + '/../test/dryrun.csv', { flags: 'w' });
    writeStream.write(`"Name","Email","Member Level", "Amount","Invoice Line Item"\n`, 'utf8')
    try {
        let users = await User.find();
        let conditionals = await conditionalApplicationsList();
        console.log(conditionals);
        await asyncForEach(users, async user => {
            await wait(1);
            let excluded = exclude(user,conditionals);
            if (excluded) {
                console.log('EXCLUDE ', user.fullname, user.email)
                return;
            }
            let lineItem = generateLineItem(user);
            if (!lineItem) {
                return;
            }
            writeStream.write(`"${user.fullname}","${user.email}","${user.memberLevel}","${lineItem.amount}","${lineItem.description}"\n`, 'utf8');

        });
        writeStream.end();
        console.log("CSV Generated.")
    } catch (e) {
        console.error(e);
    }
}


//Utilities

function exclude(user, conditionals) {
    //ADD ALL CONDITIONS
    if (!user.isMember) {
        return true;
    }
    if (user.memberLevel == 'life' || user.memberLevel == 'honorary' || user.memberLevel == 'retired' || !user.memberLevel) {
        return true;
    }
    let excludeList = [
        'gregharkins@harcomtech.com',
        ...conditionals
    ];
    if (excludeList.indexOf(user.email) > -1) {
        return true;
    }

    return false;
}

function conditionalApplicationsList(){
    return Conference.findOne({ $and: [{ startDateTime: { $lt: new Date() } }, { startDateTime: { $gt: moment().subtract(1, 'year').subtract(2, 'month').toDate() } }] })
        .then(function (conf) {
            let meetingDate = moment(conf.startDateTime).add(2, 'days').toDate();
            return MembershipApplication.find({ finalApprovedOn: { $gte: meetingDate } })
                .populate('user')
                .sort([['finalApprovedOn', 1]])
                .then(function (applications) {
                    return applications.map(application => {
                        return application.user.email;
                    });
                })
        });
}


function generateLineItem(user) {

    switch (user.memberLevel) {
        case 'active':
            return { amount: 125, description: `${moment().year() + 1} Membership Dues - Active Membership` };
        case 'intern':
            return { amount: 125, description: `${moment().year() + 1} Membership Dues - Intern Membership` };
        case 'affiliate':
            return { amount: 150, description: `${moment().year() + 1} Membership Dues - Affiliate Membership` };
        case 'foreign':
            return { amount: 150, description: `${moment().year() + 1} Membership Dues - Foreign Affiliate Membership` };

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