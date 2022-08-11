var q = require('q');
var stripe = require('stripe')(process.env.STRIPE_KEY);

module.exports = {
    test: Test,
    payInitialMembershipWithCard: PayInitialMembershipWithCard,
    payAttendeeWithCard: PayAttendeeWithCard,
    processCard:ProcessCard,
    refundTransaction:RefundTransaction
}

function Test(email) {
    return q.resolve("TEST")
}


function PayInitialMembershipWithCard(amount, cc, expMonth, expYear, cvv, name, email, address) {
    return stripeChargeCard(amount, cc, expMonth, expYear, cvv, `Initial membership dues and application fee for ${name} (${email})`, name, address)
        .then(function (chargeObject) {
            return chargeObject.id;
        })
        .catch(function (err) {

            if (err && err.message) {
                return q.reject(err.message);
            } else {
                return q.reject("Could not process payment. Please double check your card details.");
            }
        });
}

function PayAttendeeWithCard(amount, cc, expMonth, expYear, cvv, name, email, address,description) {
    const desc = description || `Conference admission fee for ${name} (${email})`;
    return stripeChargeCard(amount, cc, expMonth, expYear, cvv, desc, name, address)
        .then(function (chargeObject) {
            return chargeObject.id;
        })
        .catch(function (err) {

            if (err && err.message) {
                return q.reject(err.message);
            } else {
                return q.reject("Could not process payment. Please double check your card details.");
            }
        });
}

function ProcessCard(amount, cc, expMonth, expYear, cvv, description, name, address) {
    return stripeChargeCard(amount, cc, expMonth, expYear, cvv, description, name, address)
        .then(function (chargeObject) {
            return chargeObject.id;
        })
        .catch(function (err) {

            if (err && err.message) {
                return q.reject(err.message);
            } else {
                return q.reject("Could not process payment. Please double check your card details.");
            }
        });
}

function RefundTransaction(transaction, amount){
    var normalizedAmount = null;
    if(amount > 0){
        normalizedAmount = parseInt(amount * 100);
    }
    return stripeRefund(transaction, normalizedAmount);
}






// -- STRIPE FUNCTIONALITY ---

async function stripeCreateCustomer(email) {
    //Add person and payment details.
    var customer = await stripe.customers.create(
        { email: email }
    );
    return customer;
}

async function stripeChargeCard(amount, cc, expMonth, expYear, cvv, description, name, address = {}) {
    var charge = await stripe.charges.create({
        amount: amount * 100,
        currency: "usd",
        source: {
            object: 'card',
            name: name,
            address_line1: address.street1 || '',
            address_line2:address.street2 || '',
            address_city: address.city || '',
            address_state: address.state || '',
            address_zip: address.zip || '',
            address_country: address.country || '',
            number: cc,
            exp_month: expMonth,
            exp_year: expYear,
            cvv: cvv,
        },
        description: description
    });
    return charge;
}

async function stripeRefund(transaction,amount) {
    var object = {
        charge: transaction,
    };
    if(amount){
        object.amount = amount;
    }
    const refund = stripe.refunds.create(object);

    return refund;
}