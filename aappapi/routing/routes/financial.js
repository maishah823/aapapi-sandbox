var express = require('express');
var router = express.Router();
var Redis = require('../../services/redisSvc');
var ChangeLog = require('../../models/changeLog');
var ApiError = require('../../classes/ApiError');
var adminGuard = require('../../guards/admin.guard');
var validators = require('../../validators');
var Invoice = require('../../models/invoice');
var Payment = require('../../models/payment');
var Quickbooks = require('../../services/quickbooks');
var Credit = require('../../services/credit');
var User = require('../../models/user');

router.get('/resend-invoice/:id', (req, res) => {
    var id = req.params.id;
    if (!validators.isValidObjectId(id)) {
        return res.status(400).send(new ApiError('Invoice', 'Could not process invoice.'));
    }
    return Invoice.findById(id)
        .then(function (invoice) {
            Quickbooks.emailInvoice(invoice.invoiceRef);
            return res.json({});
        })
        .catch(function (err) {
            console.ereror(err);
            return res.status(400).send(new ApiError('Invoice', 'Could not process invoice.'));
        });
});

router.get('/invoice-pdf/:id', (req, res) => {
    var id = req.params.id;
    if (!validators.isValidObjectId(id)) {
        return res.status(400).send(new ApiError('Invoice', 'Could not process invoice.'));
    }
    return Invoice.findById(id)
        .then(function (invoice) {
            return Quickbooks.getInvoicePDF(invoice.invoiceRef)
                .then(function (pdf) {
                    res.type('application/pdf');
                    res.send(pdf);
                    return;
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(400).send(new ApiError('Invoice', 'Could not retrieve invoice.'));
                });
        })
        .catch(function (err) {
            console.ereror(err);
            return res.status(400).send(new ApiError('Invoice', 'Could not process invoice.'));
        });
});


/*    ADMIN      */

router.use(adminGuard);

router.get('/invoices', (req, res) => {
    var page = parseInt(req.query.page || 1);
    var limit = parseInt(req.query.limit || 10);
    var query = {};
    if (req.query.search) {
        query = { "invoiceNumber": { $regex: new RegExp(req.query.search), $options: 'i' } }
    } else if (req.query.filter == 'unpaid') {
        query = { paid: { $ne: true } };
    } else if (req.query.filter == 'paid') {
        query = { paid: true };
    }
    Invoice.paginate(query, {
        page: page,
        limit: limit,
        populate: [
            { path: 'payment', populate: [{ path: 'manualBy', select: 'firstName lastName fullname' }] },
            { path: 'couponCode', select: 'code type' }
        ], sort: [['invoiceNumber', -1]]

    })
        .then(function (invoices) {
            return res.json(invoices);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Invoices', 'Could not retrieve invoices.'));
        });
});

// router.get('/invoices-by-name', (req, res) => {
//     var page = parseInt(req.query.page || 1);
//     var limit = parseInt(req.query.limit || 10);
//     var query = {};
//     var queryItems = [];
//     if(!req.decoded.isDeveloper){
//         queryItems.push({email: {$ne:'gregharkins@harcomtech.com'}});
//         queryItems.push({_id:{ $ne: req.decoded._id }});
//     }

//     if(!req.query.suspended ){
//         queryItems.push({active:true});
//     }
//     if (req.query.search) {
//         queryItems.push({$or: [
//             { "lastName": { $regex: new RegExp(req.query.search), $options: 'i' } },
//             { "firstName": { $regex: new RegExp(req.query.search), $options: 'i' } },
//             { "email": { $regex: new RegExp(req.query.search), $options: 'i' } }
//         ]});
//     }
//     if (req.query.type) {
//         switch (req.query.type) {
//             case 'members':
//                queryItems.push({ isMember: true });
//                 break;
//             case 'admins':
//             queryItems.push({ isAdmin: true });
//                 break;
//             case 'attendees':
//             queryItems.push({ isAttendee: true });
//                 break;
//             case 'educators':
//             queryItems.push({ isEducator: true });
//                 break;
//             case 'instructors':
//             queryItems.push({ isInstructor: true });
//                 break;
//             default:

//         }
//     }
//     if(queryItems.length > 0){
//         query = {$and:[...queryItems]};
//     }

//     User.paginate(query, { page: page, limit: limit, sort:{'lastName': 1},select: 'active memberNumber firstName lastName region email address', populate: [{ path: 'invoices', populate:[{path:'payment'}],sort:[['payment',-1],['invoiceNumber',-1]]}] })
//         .then(function (users) {
//             return res.json(users);
//         })
//         .catch(function (err) {
//             console.error(err);
//             return res.status(500).send(new ApiError('User Listing', 'Could not retrieve users listing.'));
//         });
// });

router.get('/invoices-by-name', (req, res) => {
    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const skip = (page - 1) * limit;
    var query = {};
    if (req.query.search) {
        query = {
            $or: [
                { "lastName": { $regex: new RegExp(req.query.search), $options: 'i' } },
                { "firstName": { $regex: new RegExp(req.query.search), $options: 'i' } },
                { "email": { $regex: new RegExp(req.query.search), $options: 'i' } }
            ]
        };
    }

    const aggregate = User.aggregate([
        {
            $match: query
        },
        {
            $lookup:
            {
                from: 'membershipapplications',
                localField: '_id',
                foreignField: 'user',
                as: 'membershipapplications'
            }
        },
        {
            $lookup:
            {
                from: 'attendeeinfos',
                localField: '_id',
                foreignField: 'user',
                as: 'attendeeinfos'
            }
        },
        {
            $lookup:
            {
                from: 'invoices',
                localField: '_id',
                foreignField: 'user',
                as: 'otherinvoices'
            }
        },
        {
            $addFields: {
                modifiedInvoices: {
                    $map:
                    {
                        input: "$otherinvoices",
                        as: "invoice",
                        in: { "invoiceRef": "$$invoice._id" }
                    }
                }

            }
        },
        {
            $project: {
                name: { $concat: ['$lastName', ', ', '$firstName'] },
                email: 1,
                address: 1,
                objects: { $concatArrays: ['$attendeeinfos', '$membershipapplications', '$modifiedInvoices'] }
            }
        },
        {
            $group: {
                _id: { name: '$name', email: '$email' },
                invoices: { $addToSet: '$objects.invoiceRef' }
            }
        },
        {
            $unwind: {
                path: '$invoices'
            }

        },
        {
            $lookup:
            {
                from: 'invoices',
                localField: 'invoices',
                foreignField: '_id',
                as: 'populatedinvoices'
            }
        },
        {
            $unwind: {
                path: '$populatedinvoices',
            }

        },
        { $sort: { "populatedinvoices.paid": 1, "populatedinvoices.invoiceNumber": -1 } },
        {
            $lookup:
            {
                from: 'payments',
                localField: 'populatedinvoices.payment',
                foreignField: '_id',
                as: 'populatedinvoices.payment'
            }
        },
        {
            $unwind: {
                path: '$populatedinvoices.payment', preserveNullAndEmptyArrays: true
            }

        },
        {
            $group: {
                _id: '$_id',
                invoices: { $push: '$populatedinvoices' }
            }
        },
        {
            $facet: {
                docs: [
                    { $sort: { "_id.name": 1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                total: [
                    { $count: 'count' }
                ]
            }
        },

    ]);
    return aggregate.exec()
        .then(function (result) {
            const docs = result[0].docs;
            const totalFacet = result[0].total[0] || {};
            const total = totalFacet.count || 0;
            return res.json({ docs, page, total, limit, pages: Math.ceil(total / limit) });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Invoices', 'Error compiling invoices'));
        });
});

router.get('/invoices/:id', (req, res) => {
    var id = req.params.id;
    if (!validators.isValidObjectId(id)) {
        return res.status(500).send(new ApiError('Invoice', 'Could not retrieve requested invoice.'));
    }
    Invoice.findById(id)
        .then(function (invoice) {
            return res.json(invoice);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Invoices', 'Could not retrieve requested invoice.'));
        });

});

router.get('/financial-stats', (req, res) => {
    Redis.client.hmget('conf-stats',
        'total-invoices-count', //0
        'total-paid-invoices', //1
        'total-invoices-amount',//2 
        'total-paid-invoices-amount', //3 
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Stats', 'Could not retrieve overview stats.'));
            }
            statsObj = {
                totalInvoicesCount: result[0] || 0,
                totalPaidInvoices: result[1] || 0,
                totalInvoicesAmount: result[2] || 0,
                totalPaidInvoicesAmount: result[3] || 0

            }
            return res.json(statsObj);
        });
});

router.get('/conf-revenue', (req, res) => {

    statsObj = {
        totalInvoicesCount: 0,
        totalPaidInvoices: 0,
        totalInvoicesAmount: 0,
        totalPaidInvoicesAmount: 0

    }
    return res.json(statsObj);

});

router.get('/conf-revenue/:confId', (req, res) => {
    Redis.client.hmget('conf-stats',
        req.params.confId + '-total-invoices-count', //0
        req.params.confId + '-total-paid-invoices', //1
        req.params.confId + '-total-invoices-amount',//2 
        req.params.confId + '-total-paid-invoices-amount', //3 
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send(new ApiError('Stats', 'Could not retrieve conference revenue stats.'));
            }
            statsObj = {
                totalInvoicesCount: result[0] || 0,
                totalPaidInvoices: result[1] || 0,
                totalInvoicesAmount: result[2] || 0,
                totalPaidInvoicesAmount: result[3] || 0

            }
            return res.json(statsObj);
        });
});


router.post('/manual-payment', (req, res) => {
    if (req.decoded.groups.indexOf('financial') < 0) {
        return res.status(400).send(new ApiError('Payment', 'You do not have permission to mark as paid.'));
    }
    if (!req.body.paymentInfo) {
        return res.status(400).send(new ApiError('Payment', 'Insufficient Information.'));
    }

    var paymentInfo = req.body.paymentInfo;

    //TODO: complete payment
    var payment = new Payment({
        transaction: paymentInfo.transaction,
        companyName: paymentInfo.agency,
        firstName: paymentInfo.firstName,
        lastName: paymentInfo.lastName,
        address: paymentInfo.address,
        email: paymentInfo.email,
        invoiceNumbers: paymentInfo.invoiceNumbers,
        amount: paymentInfo.amount,
        manualBy: req.decoded._id,
        manualOn: new Date()
    });
    return payment.save()
        .then(function (obj) {
            Redis.sendToWorker('syncInvoicesToPayment', obj);
            return res.json({ complete: true });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(400).send(new ApiError('Payment', 'Manual Payment was NOT successful. Please contact support.'));
        });
});

router.post('/adjust-invoice', (req, res) => {
   
    if (!req.body.type || !req.body.amount || !req.body.invoiceId || !req.body.note) {
        return res.status(400).send(new ApiError('Invoice Adjustment', 'Insufficient Information.'));
    }

    return Invoice.findById(req.body.invoiceId).populate([{path:'payment'},{path:'user',select:'firstName lastName customerId'}])
        .then( async function (invoice) {
            if (invoice.paid && req.body.type == 'reduction') {
                let type = 'conference';
                switch (invoice.type) {
                    case 'Membership Dues':
                        type = 'membership'
                        break;
                }
                let refundAmount = req.body.amount;
                if(refundAmount > invoice.amount){
                    refundAmount = invoice.amount;
                }
                let user = invoice.user || {};
                return Quickbooks.refund(invoice._id,refundAmount,req.body.note,type,{name:user.fullname,value:user.customerId})
                .then(function (result){
                    return res.json(invoice)
                })
            }else if(invoice.paid && req.body.type !== 'reduction'){
                return res.status(400).send(new ApiError('Refund', 'You cannot add to a paid invoice. Please generate a new invoice.'));
            }
            console.log("Doing the quickbooks...");
            return Quickbooks.adjustInvoice(invoice.invoiceRef, req.body.type, req.body.amount, req.body.note)
                .then(function (newTotal) {
                    invoice.amount = newTotal;
                    if (newTotal <= 0) {
                        invoice.paid = true;
                    }
                    return invoice.save()
                        .then(function (savedInvoice) {
                            return res.json(savedInvoice);
                        });
                })
        })
        .catch(function (err) {
            var returnedError = 'Could not complete adjustment.'
            console.error(err);
            if (typeof err === 'string') {
                returnedError = err;
            }
            return res.status(400).send(new ApiError('Invoice Adustment', returnedError));
        });


});

router.post('/arbitrary-invoice', async (req, res) => {
    //Check that a user exists and that all fields are available.
    if (!req.body.userId || !req.body.amount || !req.body.description || !req.body.type) {
        return res.status(400).send(new ApiError('Invoice Creation', 'Missing information.'));
    }
    if(req.body.type != 'membership' && req.body.type != 'conference' && req.body.type != 'guest'){
        return res.status(400).send(new ApiError('Invoice Creation', 'Improper type.'));
    }
    const type = req.body.type.charAt(0).toUpperCase() + req.body.type.slice(1);
    const description = req.body.description;
    var user;
    var email;
    console.log(req.body.userId);
    try {
        user = await User.findById(req.body.userId);
        if (!user) {
            throw new Error("Could not generate invoice because the user could not be found.");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Invoice Creation', 'Problem finding user.'));
    }
    var email = user.email;
    var amount = parseFloat(req.body.amount);
    var customerId = user.customerId;

    if (!customerId) {
        try {
            customerId = await Quickbooks.createCustomer(null, user.firstName, null, user.lastName, user.address, user.email);
            await User.findByIdAndUpdate(user._id, { customerId: customerId });
        } catch (e) {
            console.error(e);
            return res.status(400).send(new ApiError('Invoice Creation', 'Could find customer in quickbooks.'));
        }
    }
    var qbResponse;
    try {
        qbResponse = await Quickbooks.createArbitraryInvoice(email, amount, type, description, customerId);
        if (!qbResponse) {
            throw new Error("Could not generate invoice - Error in Quickbooks process.");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send(new ApiError('Invoice Creation', 'Problem finding user.'));
    }
    const newInvoice = new Invoice({
        user: user._id,
        invoiceRef: qbResponse.invoiceId,
        invoiceNumber: qbResponse.invoiceNumber,
        type: type,
        memo: description,
        amount: amount
    });

    await newInvoice.save();
    res.json({});
    await Quickbooks.emailInvoice(qbResponse.invoiceId);
});

router.get('/trigger-dues-reminders',(req,res)=>{
    Redis.sendToWorker('duesReminder',{});
    Redis.writeToLog('Reminders', req.decoded.name + " triggered dues reminder emails.");
    res.json({});
});

router.get('/generate-yearly-dues',(req,res)=>{
    Redis.sendToWorker('yearlyDues',{});
    Redis.writeToLog('Yearly Dues', req.decoded.name + " generated yearly dues invoices.");
    res.json({});
});





module.exports = router;