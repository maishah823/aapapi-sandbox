var express = require('express');
var router = express.Router();
var Invoice = require('../../models/invoice');
var ApiError = require('../../classes/ApiError');
var Credit = require('../../services/credit');
var Payment = require('../../models/payment');
var Redis = require('../../services/redisSvc');
var q = require('q');

router.post('/lookupInvoice', (req, res) => {
    if (!req.body.invoiceNumber) {
        return res.status(400).send(new ApiError('Invoice Lookup', 'Bad request.'));
    }

    const invoiceNumber = req.body.invoiceNumber;
    return Invoice.findOne({ invoiceNumber: invoiceNumber, paid: { $ne: true } }).select('invoiceNumber amount created_at')
        .then(function (invoice) {
            return res.json(invoice);
        })
        .catch(function (err) {
            return res.status(500).send(new ApiError('Invoice Lookup', 'Server error while looking up invoice.'));
        });
});

router.post('/make-payment', (req, res) => {
    if (!req.body.paymentInfo) {
        return res.status(400).send(new ApiError('Payments', 'Bad request.'));
    }

    const paymentInfo = req.body.paymentInfo;
    if (!paymentInfo.cc || !paymentInfo.expMonth || !paymentInfo.expYear || !paymentInfo.cvv || !paymentInfo.amount) {
        return res.status(400).send(new ApiError('Payments', 'Payment Info Incomplete.'));
    }

    if (!paymentInfo.email || !paymentInfo.invoices || paymentInfo.invoices.length < 1) {
        return res.status(400).send(new ApiError('Payments', 'Information Incomplete.'));
    }
    var invoiceList = "";
    for (var i = 0; i < paymentInfo.invoices.length; i++) {
        if (i == 0) {
            invoiceList = '#' + paymentInfo.invoices[i];
        } else {
            invoiceList = invoiceList + ", #" + paymentInfo.invoices[i];
        }
    }
    const name = paymentInfo.agency || `${paymentInfo.firstName} ${paymentInfo.lastName}`;
    const description = `Batch payment for invoices (${invoiceList}) by ${name}`;

    // process payment
    Credit.processCard(paymentInfo.amount, paymentInfo.cc, paymentInfo.expMonth, paymentInfo.expYear, paymentInfo.cvv, description, `${paymentInfo.firstName} ${paymentInfo.lastName}`, paymentInfo.address)
        .then(function (transaction) {
            var payment = new Payment({
                transaction: transaction,
                companyName: paymentInfo.agency,
                firstName: paymentInfo.firstName,
                lastName: paymentInfo.lastName,
                address: paymentInfo.address,
                email: paymentInfo.email,
                invoiceNumbers: paymentInfo.invoices,
                amount: paymentInfo.amount
            });
            return payment.save()
                .then(function (obj) {
                    Redis.sendToWorker('syncInvoicesToPayment', obj);
                    
                    return res.json({ complete: true });
                })
                .catch(function (err) {
                    console.error(err);
                    return q.reject("Payment has gone through but there was an error recording the payment. Please contact the National Office to be sure the invoices have been credited.");
                });

        })
        .catch(function (err) {
            return res.status(400).send(new ApiError('Payments', err));
        });

});

module.exports = router;