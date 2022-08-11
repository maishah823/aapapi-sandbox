var express = require('express');
var router = express.Router();
var adminGuard = require('../../guards/admin.guard');
var Redis = require('../../services/redisSvc');
var devGuard = require('../../guards/developer.guard');
var generator = require('generate-password');
var User = require('../../models/user');
var Quickbooks = require('../../services/quickbooks');
var email = require('../../services/emailSvc');
var ApiError = require('../../classes/ApiError');
var Invoice = require('../../models/invoice');
var moment = require('moment');


router.use(adminGuard);

router.get('/system-stats', (req, res) => {
    Redis.client.hmget('general-stats',
        'total-members', //0
        'needs-update', //1

        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Stats', 'Could not retrieve system stats.'));
            }
            statsObj = {
                totalMembers: result[0] || 0,
                needsUpdate: result[1] || 0
            }
            return res.json(statsObj);
        });
});

router.get('/version-history', (req, res) => {
    var history = require('../../version_history');
    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var total = history.length;
    var pages = Math.ceil(history.length / limit);
    var returned = history.slice((page - 1) * limit, page * limit);
    return res.json({ docs: returned, page, limit, total, pages });
});

router.post('/manualmember', devGuard, async (req, res) => {

    var user;

    if (
        !req.body.user ||
        !req.body.user.firstName ||
        !req.body.user.lastName ||
        !req.body.user.email ||
        !req.body.user.memberNumber ||
        !req.body.user.memberLevel
    ) {
        return res.status(400).send(new ApiError('Override', 'Record Not Complete.'));
    }

    const object = req.body.user;

    //DO THE SAVING...
    const password = generator.generate({
        length: 8,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
        strict: true
    });
    const newUser = new User({
        firstName: object.firstName,
        lastName: object.lastName,
        middleName: object.middleName,
        email: object.email,
        memberNumber: object.memberNumber,
        isMember: true,
        password: password,
        passwordIsTemp: true,
        memberLevel: object.memberLevel,
        legacy: true
    });

    try {
        newUser.customerId = await Quickbooks.createCustomer('', newUser.firstName, newUser.middleName, newUser.lastName, {}, newUser.email);
    } catch (err) {
        return res.status(400).send(new ApiError('Override', 'Could not create quickbooks customer record.'));
    }
    try {
        user = await newUser.save();
        console.log('Manually adding... ' + user.fullname);

    } catch (err) {
        console.error(err);
        return res.status(400).send(new ApiError("Override", "Could not save user " + newUser.firstName + " " + newUser.lastName));
    }
    console.log(user);
    try {
        await email.sendManualMemberEmail(user, password);
    } catch (err) {
        console(err);
        console.error("Could not send email " + newUser.firstName + " " + newUser.lastName);
    }

    //Create Invoice if needed.
    if (object.needsInvoice) {
        console.log("GENERATING INVOICE FOR MANUAL ENTRY", user)
        let lineItem = generateLineItem(user);
        if (lineItem) {
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

            } catch (err) {
                console.error(err);

            }
        }
    }



    return res.json({});
});


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
        default:
            return null;

    }
}

module.exports = router;


