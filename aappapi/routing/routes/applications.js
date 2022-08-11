var express = require('express');
var router = express.Router();
var MembershipApplication = require('../../models/membershipApplication');
var ApiError = require('../../classes/ApiError');
var adminGuard = require('../../guards/admin.guard');
var Redis = require('../../services/redisSvc');
var Quickbooks = require('../../services/quickbooks');
var Validators = require('../../validators');
var PDFSvc = require('../../services/pdfSvc');


router.get('/', adminGuard, (req, res) => {
    const limit = parseInt(req.query.limit || 10);
    const page = parseInt(req.query.page || 1);
    const skip = (page - 1) * limit;
    var pendingQuery;
    switch (req.query.filter) {
        case 'unpaid':
            pendingQuery = { paid: { $ne: true } };
            break;
        case 'rejected':
            pendingQuery = { rejected: true };
            break;
        case 'approved':
            pendingQuery = { finalApproved: true };
            break;
        default:
            pendingQuery = { rejected: { $ne: true }, finalApproved: { $ne: true }, paid: true };
    }
    const aggregate = MembershipApplication.aggregate([
        {
            $lookup:
            {
                from: 'invoices',
                localField: 'invoiceRef',
                foreignField: '_id',
                as: 'invoice'
            }
        },
        { $unwind: '$invoice' },
        {
            $addFields: {
                paid: '$invoice.paid'
            }
        },
        {
            $addFields: {
                numberOfApproved: { $cond: [{ $and: [{ $not: ["$rejected"] }, '$finalApproved'] }, 1, 0] },
                numberOfRejected: { $cond: ["$rejected", 1, 0] },
                numberOfUnpaid: { $cond: [{ $not: ['$paid'] }, 1, 0] },
                numberOfPending: { $cond: [{ $and: [{ $not: ["$rejected"] }, { $not: ["$finalApproved"] }, '$paid'] }, 1, 0] },
            }
        },
        {
            $facet: {
                stats: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            approved: { $sum: '$numberOfApproved' },
                            rejected: { $sum: '$numberOfRejected' },
                            unpaid: { $sum: '$numberOfUnpaid' },
                            pending: { $sum: '$numberOfPending' }
                        }
                    },
                    { $project: { _id: 0 } },
                    {
                        $addFields: {
                            percentage: { $divide: ["$approved", "$total"] }
                        }
                    }
                ],
                pending: [
                    {
                        $match: pendingQuery
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user',
                            foreignField: '_id',
                            as: 'user'
                        }

                    },
                    {
                        $unwind: { "path": '$user', "preserveNullAndEmptyArrays": true }
                    },
                    {
                        $project: {
                            name: { $concat: ['$user.lastName', ', ', '$user.firstName'] },
                            location: { $concat: ['$user.address.city', ', ', '$user.address.state'] },
                            invoiceNumber: '$invoice.invoiceNumber',
                            paid: '$paid',
                            regionApproved: 1,
                            created_on: 1
                        }
                    },
                    { $sort: { "name": 1 } },
                    { $skip: skip },
                    { $limit: limit }

                ],
                total: [
                    {
                        $match: pendingQuery
                    },
                    { $count: 'count' }
                ]
            }
        },
    ]);
    return aggregate.exec()
        .then(function (result) {
            const obj = result[0];
            const stats = obj.stats[0];
            const pending = obj.pending;
            var total = 0;
            if(obj.total.length > 0){
             total = obj.total[0].count || 0;
            }
            return res.json({ stats, pending, total });
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Applications', 'Error fetching applications.'));
        });
});



router.get('/regional', (req, res) => {
    let region = req.query.region;
    let query = { rejected: { $ne: true }, regionApproved: { $ne: true } }
    
    MembershipApplication.find(query).populate([
        { path: 'user', select: 'firstName lastName address' },
        { path: 'invoiceRef', select: 'paid invoiceNumber' },
       
    ])
        .then(function (applications) {
            var returnApps = applications.filter(app => {if(app.invoiceRef && app.invoiceRef.paid){return app}});
            if(region && region != "all"){
                returnApps = returnApps.filter(app=>{
                    if(app.user.region == region){
                        return app;
                    }
                })
            }
            res.json(returnApps);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Applications', 'Error fetching applications.'));
        });
});


router.get('/detail/:id', adminGuard, (req, res) => {
    MembershipApplication.findById(req.params.id)
        .populate([
            { path: 'school' },
            { path: 'invoiceRef', populate: [{ path: 'payment' }] },
            { path: 'user', select: 'firstName lastName address email memberNumber' },
            { path: 'regionApprovedBy', select: 'firstName lastName fullname'},
            { path: 'finalApprovedBy', select: 'firstName lastName fullname'},
            { path: 'rejectedBy', select: 'firstName lastName fullname'},
        ])
        .then(function (application) {
            res.json(application);
        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Applications', 'Error fetching application.'));
        });
});

router.get('/approve/:id', adminGuard, (req, res) => {
    return MembershipApplication.findById(req.params.id).populate('invoiceRef')
        .then(function (application) {
            if (application.finalApproved) {
                return res.status(400).send(new ApiError('Applications', 'Application has already been approved.'));
            }
            if (!application.invoiceRef){
                return res.status(400).send(new ApiError('Applications', 'Unable to approve because the payment status of this application is unknown. Please contact support.'));
            }else{
                if(!application.invoiceRef.paid){
                    return res.status(400).send(new ApiError('Applications', 'Application must be paid before it can be approved.'));
                }
            }
            if (req.decoded.groups.indexOf('final-approval') < 0 && req.decoded.groups.indexOf('regional-manager') < 0) {
                return res.status(400).send(new ApiError('Applications', 'You do not have permission to approve this application.'));
            }
            if (req.decoded.groups.indexOf('final-approval') > -1) {
                if (!application.regionApproved) {
                    application.regionApproved = true;
                    application.regionApprovedOn = new Date();
                    application.regionApprovedBy = req.decoded._id;
                }
                application.finalApproved = true;
                application.finalApprovedOn = new Date();
                application.finalApprovedBy = req.decoded._id;
            } else if (req.decoded.groups.indexOf('regional-manger')) {
                if (!application.regionApproved) {
                    application.regionApproved = true;
                    application.regionApprovedOn = new Date();
                    application.regionApprovedBy = req.decoded._id;
                } else {
                    return res.status(400).send(new ApiError('Applications', 'Already approved in region.'));
                }
            }
            return application.save()
                .then(function (updated) {
                    if (updated.finalApproved) {
                        Redis.sendToWorker('makeMember', application.user);
                    }
                    return res.json({ complete: true });
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(400).send(new ApiError('Applications', 'Error approving application.'));
                });

        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Applications', 'Error approving application.'));
        });
});

router.post('/deny/:id', adminGuard, (req, res) => {
    if (!req.body.reason) {
        return res.status(400).send(new ApiError('Applications', 'Must provide a reason for rejection.'));
    }
    return MembershipApplication.findById(req.params.id).populate([{path:'user'},{path:'invoiceRef'}])
        .then(function (application) {
            const deniedUser = application.user;
            const invoice = application.invoiceRef;
            if (application.finalApproved) {
                return res.status(400).send(new ApiError('Applications', 'Application has already been approved.'));
            }
            if (application.rejected) {
                return res.status(400).send(new ApiError('Applications', 'Application has already been rejected.'));
            }
            if (req.decoded.groups.indexOf('final-approval') < 0 && req.decoded.groups.indexOf('regional-manager') < 0) {
                return res.status(400).send(new ApiError('Applications', 'You do not have permission to deny this application.'));
            }

            application.rejected = true;
            application.rejectedOn = new Date();
            application.rejectedBy = req.decoded._id;
            application.rejectedReason = req.body.reason;

            return application.save()
                .then(function (updated) {
                    res.json({ complete: true });
                    Redis.sendToWorker('rejectMember',{email:deniedUser.email, name:deniedUser.fullname, reason:req.body.reason});
                    Quickbooks.refund(invoice,invoice.amount - 25,`${deniedUser.fullname} rejected by AAPP. Refunded Fees.`,'membership');
                })
                .catch(function (err) {
                    console.error(err);
                    return res.status(400).send(new ApiError('Applications', 'Error rejecting application.'));
                });

        })
        .catch(function (err) {
            console.error(err);
            return res.status(500).send(new ApiError('Applications', 'Error rejecting application.'));
        });
});


router.get('/pdf/:id',(req,res)=>{
    if(!req.params['id'] || !Validators.isValidObjectId(req.params['id'])){
        return res.status(400).send(new ApiError('Applications', 'Could not locate application for printing.'));
    }

    return MembershipApplication.findById(req.params['id']).populate([{path:'user'},{path:'school'},{path:'invoiceRef'}])
    .then(function(app){
        return PDFSvc.application(res,app)
        .then(function(result){
            console.log(`${app.user.lastName}'s application was downloaded.`);
        });
    })
    .catch(function(err){
        console.error(err);
        return res.status(400).send(new ApiError('Applications', 'Could not create application PDF.'));
    });
});



module.exports = router;