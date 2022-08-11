var Redis = require('../../services/redisSvc');
var Guest = require('../../models/guest');
var User = require('../../models/user');
var Attendee = require('../../models/attendeeInfo');
var Invoice = require('../../models/invoice');
var mongoose = require('mongoose');
var moment = require('moment');

module.exports = function (type, done) {

    Redis.client.get('currentconf', (err, result) => {
        if (!err && result) {
            switch (type) {
                case 'all':
                    all(result);
                    break;
                case 'newsignup':
                    newsignup(result);
                    break;
                case 'attendees':
                    attendees(result);
                    break;
                case 'guests':
                    guests(result);
                    break;
                case 'invoices':
                    invoices();
                    break;
                case 'confrevenue':
                    confRevenue();
                    break;
            }
            done();
        } else {
            console.error(err);
        }
    });

}

function all(conf) {
    attendees(conf);
    guests(conf);
    vendors(conf);
    representatives(conf);
    extraevents(conf);
    classroomevents(conf);
    invoices();
    confRevenue();
}

function newsignup(conf) {
    attendees(conf);
    guests(conf);
    vendors(conf);
    representatives(conf);
    invoices();
    confRevenue();
}

function attendees(conf) {
    const aggregate = Attendee.aggregate([
        { $match: { $and: [{ finalApproved: true }, { conference: mongoose.Types.ObjectId(conf) }] } },
        {
            $lookup: {
                from: "invoices",
                localField: "invoiceRef",
                foreignField: "_id",
                as: "invoice"
            }
        },
        {
            $unwind: {
                path: "$invoice",
                "preserveNullAndEmptyArrays": true
            }
        },

        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                paid: { $sum: { $cond: ['$invoice.paid', 1, 0] } },
                checkedin: { $sum: { $cond: ['$checkedIn', 1, 0] } }
            }
        }


    ]);

    aggregate.exec()
        .then(function (result) {
           
            if (result && result[0]) {
                Redis.client.hmset('conf-stats',
                {
                    'approved-attendees': result[0].total,
                    'paid-attendees': result[0].paid,
                    'checkedin-attendees': result[0].checkedin
                },
                    () => {
                       
                        Redis.publish('admin', 'updateConfStats', 'updated');
                    });
            } else {
                Redis.client.hmset('conf-stats',
                {
                'approved-attendees': 0,
                'paid-attendees': 0,
                'checkedin-attendees': 0
                },
                () => {
                    
                    Redis.publish('admin', 'updateConfStats', 'updated');
                });
            }
        })
        .catch(function (err) {
            console.error(err);

        });
}

function guests(conf) {
    const aggregate = Guest.aggregate([
        { $match: { conference: mongoose.Types.ObjectId(conf) } },
        { $count: "total" }


    ]);

    aggregate.exec()
        .then(function (result) {
            if (result && result[0]) {
                save('guests', result[0].total || 0)
            }else{
                save('guests', 0)
            }
        })
        .catch(function (err) {
            console.error(err);

        });
}

function invoices(conf) {
    const aggregate = Invoice.aggregate([
        { $match: { "created_at": { "$gte": moment().startOf('year').toDate(), "$lte": moment().endOf('year').toDate() } } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                paid: { $sum: { $cond: ['$paid', 1, 0] } },
                totalAmount: { $sum: '$amount' },
                paidAmount: { $sum: { $cond: ['$paid', '$amount', 0] } },
            }
        },
        {
            $project: {
                _id: 0
            }
        }


    ]);

    aggregate.exec()
        .then(function (result) {
            if (result && result[0]) {
                Redis.client.hmset('conf-stats',
                {
                    'total-invoices-count': result[0].total,
                    'total-paid-invoices': result[0].paid,
                    'total-invoices-amount': result[0].totalAmount,
                    'total-paid-invoices-amount': result[0].paidAmount
                },
                    () => {
                        
                        Redis.publish('admin', 'updateConfStats', 'updated');
                    });
            }else{
                Redis.client.hmset('conf-stats',
                {
                    'total-invoices-count': 0,
                    'total-paid-invoices': 0,
                    'total-invoices-amount': 0,
                    'total-paid-invoices-amount': 0
                },
                    () => {
                        
                        Redis.publish('admin', 'updateConfStats', 'updated');
                    });
            }
        })
        .catch(function (err) {
            console.error(err);

        });
}

function confRevenue() {
    const aggregate = Attendee.aggregate([
        {
            $lookup: {
                from: "invoices",
                localField: "invoiceRef",
                foreignField: "_id",
                as: "invoice"
            }
        },
        {$unwind:'$invoice'},
        { $group: {
            _id:'$conference',
            invoice: {$addToSet:'$invoice'}
        }},
        {$unwind:'$invoice'},
        {
            $group: {
                _id: '$_id',
                total: { $sum: 1 },
                paid: { $sum: { $cond: ['$invoice.paid', 1, 0] } },
                totalAmount: { $sum: '$invoice.amount' },
                paidAmount: { $sum: { $cond: ['$invoice.paid', '$invoice.amount', 0] } },
            }
        }


    ]);

    aggregate.exec()
        .then(function (result) {
            result.forEach(element => {
                if (element._id) {
                    Redis.client.hmset('conf-stats',
                    {
                        [element._id + '-total-invoices-count']: element.total,
                        [element._id + '-total-paid-invoices']: element.paid,
                        [element._id + '-total-invoices-amount']: element.totalAmount,
                        [element._id + '-total-paid-invoices-amount']: element.paidAmount
                    },
                        () => {
                            
                            Redis.publish('admin', 'updateConfStats', 'updated');
                        })
                }
            });

        })
        .catch(function (err) {
            console.error(err);

        });
}

function extraevents(conf) {

}

function classroomevents(conf) {

}

function vendors(conf) {

}

function representatives(conf) {

}

function save(field, value) {

    Redis.client.hset('conf-stats', field, value, () => {
        
        Redis.publish('admin', 'updateConfStats', 'updated');
    })
}

