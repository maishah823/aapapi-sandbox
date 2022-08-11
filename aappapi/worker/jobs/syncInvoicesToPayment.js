var Payment = require('../../models/payment');
var Invoice = require('../../models/invoice');
var Quickbooks = require('../../services/quickbooks');
var Redis = require('../../services/redisSvc');
var q = require('q');

module.exports = function(paymentId, done){
    Payment.findById(paymentId)
    .then(function(payment){
        var promises = [];
        invoiceNumbers = payment.invoiceNumbers;
        invoiceNumbers.forEach((num)=>{
            promises.push(Invoice.findOne({invoiceNumber:num})
                .then(function(invoice){
                    invoice.paid = true;
                    invoice.payment = payment._id;
                    return invoice.save()
                    .then(Quickbooks.payInvoice(invoice.invoiceRef))
                    .then(function(){
                        Quickbooks.emailInvoice(invoice.invoiceRef);
                    });
                })
                .catch(function(err){
                    console.error(err);
                    return q.reject(err);
                }));
        });

        q.all(promises)
        .then(function(){
            console.log("INVOICES UPDATED");
            Redis.sendToWorker('confstats', 'all');
            done();
        })
        .catch(function(err){
            console.error("ERROR syncing payments: ", err);
        });
        
    });
}