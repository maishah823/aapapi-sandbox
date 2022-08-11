var QuickBooks = require('node-quickbooks')
QuickBooks.setOauthVersion('2.0');
var Redis = require('./redisSvc');
var q = require('q');
var jwt = require('jsonwebtoken');
var LocalInvoice = require('../models/invoice');
var Credit = require('../services/credit');
var EmailSvc = require('../services/emailSvc');

module.exports = {
    test: Test,
    getAuthURL: GetAuthURL,
    createCustomer: CreateCustomer,
    updateCustomer: UpdateCustomer,
    createMembershipInvoice: CreateMembershipInvoice,
    createDuesInvoice: CreateDuesInvoice,
    createConferenceInvoice: CreateConferenceInvoice,
    createVendorInvoice: CreateVendorInvoice,
    createGuestInvoice:CreateGuestInvoice,
    createArbitraryInvoice:CreateArbitraryInvoice,
    payInvoice: PayInvoice,
    emailInvoice: EmailInvoice,
    deleteInvoice: DeleteInvoice,
    deletePayment: DeletePayment,
    makeEntities: MakeEntities,
    refund: Refund,
    findCustomerByQBId: FindCustomerByQBId,
    adjustInvoice: AdjustInvoice,
    getInvoicePDF: GetInvoicePDF
};

function qbo() {
    return Redis.qbtoken()
        .then(function (token) {
            console.log("redis token:         ;; ;::::: " + token);
            return new QuickBooks(process.env.QUICKBOOKS_ID,
                process.env.QUICKBOOKS_SECRET,
                token,
                false,
                process.env.QUICKBOOKS_COMPANY,
                process.env.QUICKBOOKS_USE_SANDBOX ? true : false,
                false,
                4,
                '2.0');
        })
        .catch(function (err) {
            console.error(err);
        });
}

function GetAuthURL() {
    return QuickBooks.AUTHORIZATION_URL +
        '?client_id=' + process.env.QUICKBOOKS_ID +
        '&redirect_uri=' + process.env.BASE_URL + '/quickbooks-auth-callback' +
        '&scope=com.intuit.quickbooks.accounting' +
        '&response_type=code' +
        '&state=' + process.env.QUICKBOOKS_STATE_SECRET
}

function CreateCustomer(title, firstName, middleName, lastName, address, email) {
    var deferred = q.defer();
    qbo()
        .then(function (qbo) {

            qbo.createCustomer(
                {
                    "BillAddr": {
                        "Line1": address.street1 || '',
                        "Line2": address.street2 || '',
                        "City": address.city || '',
                        "Country": address.country || '',
                        "CountrySubDivisionCode": address.state || '',
                        "PostalCode": address.zip || ''
                    },
                    "Title": title || '',
                    "GivenName": firstName || '',
                    "MiddleName": middleName || '',
                    "FamilyName": lastName || '',
                    "FullyQualifiedName": `${firstName} ${middleName} ${lastName}`,
                    "DisplayName": `${firstName} ${lastName} (${email})`,
                    "PrimaryPhone": {
                        "FreeFormNumber": address.cellPhone || address.workPhone || ''
                    },
                    "PrimaryEmailAddr": {
                        "Address": email || ''
                    }

                }, (err, res, body) => {
                    if (err) {
                        var message = "Error processing application.";
                        if (err.Fault && err.Fault.Error) {
                            if (err.Fault.Error[0] && err.Fault.Error[0].code == 6240) {
                                console.log("CUSTOMER RECORDS ALREADY EXISTS");
                                qbo.findCustomers({ "DisplayName": `${firstName} ${lastName} (${email})` }, (custError, customers) => {
                                    if (custError || customers.QueryResponse.Customer.length < 1) {

                                        console.error(JSON.stringify(custError));
                                        deferred.reject("Could not process application.");
                                    } else {
                                        console.log("CUSTOMER ID: ", customers.QueryResponse.Customer[0].Id);
                                        deferred.resolve(customers.QueryResponse.Customer[0].Id);
                                    }
                                    return;
                                });
                            }
                        } else {
                            console.error(JSON.stringify(err));
                            deferred.reject(message);
                            return;
                        }

                    } else {
                        deferred.resolve(res.Id);
                    }
                });

        })
        .catch(function (errors) {
            console.error(errors);
            deferred.reject("Error processing application.");
        });
    return deferred.promise;
}

function UpdateCustomer(user) {

    if (!user.customerId) {
        return q.reject("No customer Id");
    }

    if (!user.email) {
        return q.reject("No email.");
    }

    if (!user.address) {
        user.address = {};
    }

    var deferred = q.defer();
    qbo()
        .then(function (qbo) {

            qbo.getCustomer(user.customerId, (err, qbcustomer) => {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                if (!qbcustomer) {
                    deferred.reject('Could not locate customer.');
                    return;
                }
                qbcustomer['PrimaryEmailAddr'] = {
                    "Address": user.email || ''
                }
                qbcustomer['BillAddr'] = {
                    "Line1": user.address.street1 || '',
                    "Line2": user.address.street2 || '',
                    "City": user.address.city || '',
                    "Country": user.address.country || '',
                    "CountrySubDivisionCode": user.address.state || '',
                    "PostalCode": user.address.zip || ''
                };
                qbcustomer['PrimaryPhone'] = {
                    "FreeFormNumber": user.address.cellPhone || user.address.workPhone || ''
                };

                qbcustomer['DisplayName'] = `${user.firstName} ${user.lastName} (${user.email})`;

                qbo.updateCustomer(qbcustomer, (err, res, body) => {
                    if (err) {

                        deferred.reject(err);

                    } else {
                        deferred.resolve(res.Id);
                    }
                });

            })
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function CreateMembershipInvoice(email, amount, type, description, customerId, discount) {
    var deferred = q.defer();
    var typeCode;
    switch (type) {
        case 'Membership':
            typeCode = process.env.QB_MEMBERSHIP_ITEM;
            break;
    }
    qbo()
        .then((qbo) => {

            var discountObject = {
                "Amount": amount / 2,
                "DetailType": "DiscountLineDetail",
                "DiscountLineDetail": {
                    "PercentBased": false,
                    //"DiscountPercent": 50,
                    "DiscountAccountRef": {
                        "value": process.env.QB_DISCOUNTS_ACCOUNT,
                        "name": "Discounts"
                    }
                }
            };

            var invoiceObject = {
                "Line": [
                    {
                        "Amount": 25,
                        "DetailType": "SalesItemLineDetail",
                        "Description": "Non-refundable application fee.",
                        "SalesItemLineDetail": {
                            "ItemRef": {
                                "value": process.env.QB_APPLICATION_FEE_ITEM,
                                "name": "Application Fee"
                            }
                        }
                    },
                    {
                        "Amount": amount,
                        "Description": description,
                        "DetailType": "SalesItemLineDetail",
                        "SalesItemLineDetail": {
                            "ItemRef": {
                                "value": typeCode,
                                "name": type
                            }
                        }
                    },
                    {
                        "Amount": amount + 25,
                        "DetailType": "SubTotalLineDetail",
                        "SubTotalLineDetail": {}
                    }

                ],
                "CustomerRef": {
                    "value": customerId
                },
                "TotalAmt": discount ? (amount / 2) + 25 : amount + 25,
                "BillEmail": {
                    "Address": process.env.NODE_ENV == 'development' ? 'gregharkins@harcomtech.com' : email
                },
                "CustomerMemo": {
                    "value": "Invoices can be paid online at https://www.americanassociationofpolicepolygraphists.org/pay. Please keep this invoice number. Organizations can pay multiple invoices at once using the invoice numbers."
                }
            };
            if (discount) {
                invoiceObject["Line"].push(discountObject);
            }
            qbo.createInvoice(
                invoiceObject,
                (err, res, body) => {
                    if (err) {
                        console.error(JSON.stringify(err));
                        deferred.reject("Could not process invoice.");
                        return;
                    }
                    deferred.resolve({ invoiceId: res.Id, invoiceNumber: res.DocNumber, invoiceAmount: res.TotalAmt });

                }
            )
        })
        .catch(function (err) {
            console.error(JSON.stringify(err));
            deferred.reject("Could not process invoice");
        });
    return deferred.promise;
}

function CreateDuesInvoice(email, amount, type, description, customerId) {
    var deferred = q.defer();
    var typeCode;
    switch (type) {
        case 'Membership':
        case 'membership':
            typeCode = process.env.QB_MEMBERSHIP_ITEM;
            break;
    }
    qbo()
        .then((qbo) => {


            var invoiceObject = {
                "Line": [
                   
                    {
                        "Amount": amount,
                        "Description": description,
                        "DetailType": "SalesItemLineDetail",
                        "SalesItemLineDetail": {
                            "ItemRef": {
                                "value": typeCode,
                                "name": type
                            }
                        }
                    },
                    {
                        "Amount": amount,
                        "DetailType": "SubTotalLineDetail",
                        "SubTotalLineDetail": {}
                    }

                ],
                "CustomerRef": {
                    "value": customerId
                },
                "TotalAmt": amount,
                "BillEmail": {
                    "Address": process.env.NODE_ENV == 'development' ? 'gregharkins@harcomtech.com' : email
                },
                "CustomerMemo": {
                    "value": "Invoices can be paid online at https://www.americanassociationofpolicepolygraphists.org/pay. Please keep this invoice number. Organizations can pay multiple invoices at once using the invoice numbers."
                }
            };
            
            qbo.createInvoice(
                invoiceObject,
                (err, res, body) => {
                    if (err) {
                        console.error(JSON.stringify(err));
                        deferred.reject("Could not process invoice.");
                        return;
                    }
                    deferred.resolve({ invoiceId: res.Id, invoiceNumber: res.DocNumber, invoiceAmount: res.TotalAmt });

                }
            )
        })
        .catch(function (err) {
            console.error(JSON.stringify(err));
            deferred.reject("Could not process invoice");
        });
    return deferred.promise;
}

function CreateArbitraryInvoice(email, amount, type, description, customerId) {
    var deferred = q.defer();
    var typeCode;
    switch (type) {
        case 'Membership':
        case 'membership':
            typeCode = process.env.QB_MEMBERSHIP_ITEM;
            break;
        case 'Conference':
        case 'conference':
            typeCode = process.env.QB_CONFERENCE_FEE_ITEM;
            break;
        case 'Guest':
        case 'guest':
            typeCode = process.env.QB_CONFERENCE_GUEST_ITEM;
            break;
    }
    qbo()
        .then((qbo) => {


            var invoiceObject = {
                "Line": [
                   
                    {
                        "Amount": amount,
                        "Description": description,
                        "DetailType": "SalesItemLineDetail",
                        "SalesItemLineDetail": {
                            "ItemRef": {
                                "value": typeCode,
                                "name": type
                            }
                        }
                    },
                    {
                        "Amount": amount,
                        "DetailType": "SubTotalLineDetail",
                        "SubTotalLineDetail": {}
                    }

                ],
                "CustomerRef": {
                    "value": customerId
                },
                "TotalAmt": amount,
                "BillEmail": {
                    "Address": process.env.NODE_ENV == 'development' ? 'gregharkins@harcomtech.com' : email
                },
                "CustomerMemo": {
                    "value": "Invoices can be paid online at https://www.americanassociationofpolicepolygraphists.org/pay. Please keep this invoice number. Organizations can pay multiple invoices at once using the invoice numbers."
                }
            };
            
            qbo.createInvoice(
                invoiceObject,
                (err, res, body) => {
                    if (err) {
                        console.error(JSON.stringify(err));
                        deferred.reject("Could not process invoice.");
                        return;
                    }
                    deferred.resolve({ invoiceId: res.Id, invoiceNumber: res.DocNumber, invoiceAmount: res.TotalAmt });

                }
            )
        })
        .catch(function (err) {
            console.error(JSON.stringify(err));
            deferred.reject("Could not process invoice");
        });
    return deferred.promise;
}



function CreateConferenceInvoice(email, total, conferenceAmount, guestAmount, discount, customerId, description) {
    var deferred = q.defer();
    qbo()
        .then((qbo) => {

            var discountObject;
            var guestObject;

            if (discount > 0) {

                discountObject = {
                    "Amount": discount,
                    "DetailType": "DiscountLineDetail",
                    "DiscountLineDetail": {
                        "DiscountAccountRef": {
                            "value": process.env.QB_DISCOUNTS_ACCOUNT,
                            "name": "Discounts"
                        }
                    }
                };
            }

            if (guestAmount > 0) {
                guestObject = {
                    "Amount": guestAmount,
                    "Description": 'Conference Guests',
                    "DetailType": "SalesItemLineDetail",
                    "SalesItemLineDetail": {
                        "ItemRef": {
                            "value": process.env.QB_CONFERENCE_GUEST_ITEM,
                            "name": 'Conference Guest Fees'
                        }
                    }
                };
            }

            var invoiceObject = {
                "Line": [
                    {
                        "Amount": conferenceAmount,
                        "DetailType": "SalesItemLineDetail",
                        "Description": description,
                        "SalesItemLineDetail": {
                            "ItemRef": {
                                "value": process.env.QB_CONFERENCE_FEE_ITEM,
                                "name": "Conference Admission"
                            }
                        }
                    },

                    {
                        "Amount": conferenceAmount + (guestAmount || 0),
                        "DetailType": "SubTotalLineDetail",
                        "SubTotalLineDetail": {}
                    }

                ],
                "CustomerRef": {
                    "value": customerId
                },
                "TotalAmt": (conferenceAmount + (guestAmount || 0) - (discount || 0)),
                "BillEmail": {
                    "Address": process.env.NODE_ENV == 'development' ? 'gregharkins@harcomtech.com' : email
                },
                "CustomerMemo": {
                    "value": "Thank you for signing up. Check your email for futher information and instructions. Invoices can be paid online at https://www.americanassociationofpolicepolygraphists.org/pay"
                }
            };
            if (guestObject) {
                invoiceObject["Line"].push(guestObject);
            }
            if (discountObject) {
                invoiceObject["Line"].push(discountObject);
            }
            qbo.createInvoice(
                invoiceObject,
                (err, res, body) => {
                    if (err) {
                        console.error(JSON.stringify(err));
                        deferred.reject("Could not process invoice.");
                        return;
                    }
                    deferred.resolve({ invoiceId: res.Id, invoiceNumber: res.DocNumber, invoiceAmount: res.TotalAmt });

                }
            )
        })
        .catch(function (err) {
            console.error('CONFERENCE INVOICE: ', JSON.stringify(err));
            deferred.reject("Could not process invoice - connection error.");
        });
    return deferred.promise;
}


function CreateVendorInvoice(email, total, customerId, description) {
    console.log("PROCESSING VENDOR");
    var deferred = q.defer();
    qbo()
        .then((qbo) => {


            var invoiceObject = {
                "Line": [
                    {
                        "Amount": total,
                        "DetailType": "SalesItemLineDetail",
                        "Description": description,
                        "SalesItemLineDetail": {
                            "ItemRef": {
                                "value": process.env.QB_VENDOR_DONATION,
                                "name": "Vendor Donation"
                            }
                        }
                    },

                    // {
                    //     "Amount": total,
                    //     "DetailType": "SubTotalLineDetail",
                    //     "SubTotalLineDetail": {}
                    // }

                ],
                "CustomerRef": {
                    "value": customerId
                },
                "TotalAmt": total,
                "BillEmail": {
                    "Address": process.env.NODE_ENV == 'development' ? 'gregharkins@harcomtech.com' : email
                },
                "CustomerMemo": {
                    "value": "Thank you for your donation."
                }
            };

            qbo.createInvoice(
                invoiceObject,
                (err, res, body) => {
                    if (err) {
                        console.error('VENDOR INVOICE: ', JSON.stringify(err));
                        deferred.reject("Could not process invoice.");
                        return;
                    }
                    console.log("INVOICE: ", res);
                    deferred.resolve({ invoiceId: res.Id, invoiceNumber: res.DocNumber, invoiceAmount: res.TotalAmt });

                }
            )
        })
        .catch(function (err) {
            console.log(err);
            console.error(JSON.stringify(err));
            deferred.reject("Could not process invoice - connection error.");
        });
    return deferred.promise;
}

function CreateGuestInvoice(email, total, customerId, description) {
    console.log("PROCESSING GUEST");
    var deferred = q.defer();
    qbo()
        .then((qbo) => {


            var invoiceObject = {
                "Line": [
                    {
                        "Amount": total,
                        "DetailType": "SalesItemLineDetail",
                        "Description": description,
                        "SalesItemLineDetail": {
                            "ItemRef": {
                                "value": process.env.QB_CONFERENCE_GUEST_ITEM,
                                "name": 'Conference Guest Fees'
                            }
                        }
                    },

                    // {
                    //     "Amount": total,
                    //     "DetailType": "SubTotalLineDetail",
                    //     "SubTotalLineDetail": {}
                    // }

                ],
                "CustomerRef": {
                    "value": customerId
                },
                "TotalAmt": total,
                "BillEmail": {
                    "Address": process.env.NODE_ENV == 'development' ? 'gregharkins@harcomtech.com' : email
                },
                "CustomerMemo": {
                    "value": "Thank you for your purchase."
                }
            };

            qbo.createInvoice(
                invoiceObject,
                (err, res, body) => {
                    if (err) {
                        console.error('GUEST INVOICE: ', JSON.stringify(err));
                        deferred.reject("Could not process invoice.");
                        return;
                    }
                    
                    deferred.resolve({ invoiceId: res.Id, invoiceNumber: res.DocNumber, invoiceAmount: res.TotalAmt });

                }
            )
        })
        .catch(function (err) {
            console.log(err);
            console.error(JSON.stringify(err));
            deferred.reject("Could not process invoice - connection error.");
        });
    return deferred.promise;
}

function PayInvoice(invoiceId) {
    var deferred = q.defer();
    qbo()
        .then(function (qbo) {
            qbo.findInvoices(
                { Id: invoiceId },
                (err, invoices) => {
                    if (err) {
                        console.error(JSON.stringify(err));
                        deferred.reject("Cannot complete payment - invoicing error.");
                        return;
                    } else {
                        var InvoicesArray = invoices.QueryResponse.Invoice || [];
                        if (InvoicesArray.length < 1) {
                            deferred.reject("Could not apply payment to invoice.");
                            return;
                        }
                        var singleInvoice = InvoicesArray[0];

                        qbo.createPayment(
                            {
                                "CustomerRef": singleInvoice.CustomerRef,
                                "TotalAmt": singleInvoice.TotalAmt,
                                "Line": [
                                    {
                                        "Amount": singleInvoice.TotalAmt,
                                        "LinkedTxn": [
                                            {
                                                "TxnId": singleInvoice.Id,
                                                "TxnType": "Invoice"
                                            }]
                                    }]
                            },
                            (err, paymentResponse) => {
                                if (err) {
                                    console.error(JSON.stringify(err));
                                    deferred.reject("Cannot complete payment");
                                    return;
                                }
                                deferred.resolve(paymentResponse.Id);
                            }
                        )

                    }

                }
            )
        })
        .catch(function (errors) {
            console.error(JSON.stringify(errors));
            deferred.reject("Could not complete payment.");
        });

    return deferred.promise;
}

function EmailInvoice(invoiceId) {
    qbo()
        .then(function (qbo) {
            qbo.sendInvoicePdf(invoiceId, null, (err, response) => {
                if (err) {
                    console.error("ERROR SENDING INVOICE: ", JSON.stringify(err));
                } else {
                    console.log("QB INVOICE SENT");
                }
            });
        })
        .catch(function (err) {
            console.error("ERROR SENDING INVOICE: ", err);
        });
}

function DeleteInvoice(id) {
    qbo()
        .then(function (qbo) {
            qbo.deleteInvoice(id, (err, response) => {
                if (err) {
                    console.error("ERROR DELETING INVOICE: ", JSON.stringify(err));
                } else {
                    console.log("QB INVOICE DELETED");
                }
            });
        })
        .catch(function (err) {
            console.error("ERROR DELETING INVOICE: ", err);
        });
}

function DeletePayment(id) {
    qbo()
        .then(function (qbo) {
            qbo.deletePayment(id, (err, response) => {
                if (err) {
                    console.error("ERROR DELETING PAYMENT: ", JSON.stringify(err));
                } else {
                    console.log("QB PAYMENT DELETED");
                }
            });
        })
        .catch(function (err) {
            console.error("ERROR DELETING INVOICE: ", err);
        });
}

function MakeEntities() {
    console.log("INTIALIZING QUICKBOOKS OBJECTS");
    qbo()
        .then(function (qbo) {
            //MEMBERSHIP ITEM
            qbo.findItems(
                { Name: 'Membership Dues' },
                (err, MembershipItems) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const items = MembershipItems.QueryResponse.Item || [];
                    //If no record found, create one.
                    if (items.length > 0) {
                        if (items[0].Id != process.env.QB_MEMBERSHIP_ITEM) {
                            console.log(`UPDATE MEMBERSHIP REF FROM ${process.env.QB_MEMBERSHIP_ITEM} to ${items[0].Id}`);
                            process.env['QB_MEMBERSHIP_ITEM'] = items[0].Id;
                        }
                    } else {
                        console.error("IMPORTANT: ", "* Membership Dues * item must be added to quickbooks!");
                    }

                });

            //APPLICATION FEE ITEM
            qbo.findItems(
                { Name: 'Application Fee' },
                (err, ApplicationFeeItems) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const items = ApplicationFeeItems.QueryResponse.Item || [];
                    //If no record found, create one.
                    if (items.length > 0) {
                        if (items[0].Id != process.env.QB_APPLICATION_FEE_ITEM) {
                            console.log(`UPDATE APPLICATION FEE REF FROM ${process.env.QB_APPLICATION_FEE_ITEM} to ${items[0].Id}`);
                            process.env['QB_APPLICATION_FEE_ITEM'] = items[0].Id;
                        }
                    } else {
                        console.error("IMPORTANT: ", "* Application Fee * item must be added to quickbooks!");
                    }

                });


            qbo.findItems(
                { Name: 'Conference Admission' },
                (err, ApplicationFeeItems) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const items = ApplicationFeeItems.QueryResponse.Item || [];
                    //If no record found, create one.
                    if (items.length > 0) {
                        if (items[0].Id != process.env.QB_CONFERENCE_FEE_ITEM) {
                            console.log(`UPDATE CONFERENCE FEE REF FROM ${process.env.QB_CONFERENCE_FEE_ITEM} to ${items[0].Id}`);
                            process.env['QB_CONFERENCE_FEE_ITEM'] = items[0].Id;
                        }
                    } else {
                        console.error("IMPORTANT: ", "* Conference Admission * item must be added to quickbooks!");
                    }

                });

            qbo.findItems(
                { Name: 'Conference Guest' },
                (err, ApplicationFeeItems) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const items = ApplicationFeeItems.QueryResponse.Item || [];
                    //If no record found, create one.
                    if (items.length > 0) {
                        if (items[0].Id != process.env.QB_CONFERENCE_GUEST_ITEM) {
                            console.log(`UPDATE CONFERENCE GUEST REF FROM ${process.env.QB_CONFERENCE_GUEST_ITEM} to ${items[0].Id}`);
                            process.env['QB_CONFERENCE_GUEST_ITEM'] = items[0].Id;
                        }
                    } else {
                        console.error("IMPORTANT: ", "* Conference Guest * item must be added to quickbooks!");
                    }

                });

            qbo.findItems(
                { Name: 'Vendor Donation' },
                (err, ApplicationFeeItems) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const items = ApplicationFeeItems.QueryResponse.Item || [];
                    //If no record found, create one.
                    if (items.length > 0) {
                        if (items[0].Id != process.env.QB_VENDOR_DONATION) {
                            console.log(`UPDATE CONFERENCE VENDOR REF FROM ${process.env.QB_VENDOR_DONATION} to ${items[0].Id}`);
                            process.env['QB_VENDOR_DONATION'] = items[0].Id;
                        }
                    } else {
                        console.error("IMPORTANT: ", "* Vendor Donation * item must be added to quickbooks!");
                    }

                });

            //DISCOUNTS ACCOUNT
            qbo.findAccounts(
                { Name: "Discounts" },
                (err, DiscountAccounts) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const accounts = DiscountAccounts.QueryResponse.Account || [];
                    //If no record found, create one.
                    if (accounts.length > 0) {
                        if (accounts[0].Id != process.env.QB_DISCOUNTS_ACCOUNT) {
                            console.log(`UPDATE DISCOUNTS ACCOUNT REF FROM ${process.env.QB_DISCOUNTS_ACCOUNT} to ${accounts[0].Id}`);
                            process.env['QB_DISCOUNTS_ACCOUNT'] = accounts[0].Id;
                        }
                    } else {
                        console.error("IMPORTANT: ", "* Discounts * account must be added to quickbooks!");
                    }

                });

        })
        .catch(function (err) {
            console.error("ERROR CONNECTING TO QUICKBOOKS (MAKE ENTITIES): ", err);
        });
}

function Refund(localInvoiceId, amount, reason, type, customerRef = null) {

    // customerRef = {name:"NameOfPerson",value:"CustomerID"}
    //Do the refund on stripe
    //Query for the invoice
    //Update to reflect the the new cost
    //Update the local invoice
    //If paid, update the quickbooks payment
    //Update the local invoice
    if (!type || (type != 'membership' && type != 'conference' && type != 'guests')) {
        return q.reject("Need a type of membership, conference, guests to process.");

    }
    if (!amount) {
        return q.reject("No Amount was attached.");
    }

    var item;
    var qbInvoiceRef;

    switch (type) {
        case 'membership':
            item = process.env.QB_MEMBERSHIP_ITEM;
            break;
        case 'guests':
            item = process.env.QB_CONFERENCE_GUEST_ITEM;
            break;
        case 'conference':
            item = process.env.QB_MEMBERSHIP_ITEM;
            break;
    }

    return qbo()
        .then((qbo) => {
            var qbInvoice;
            var qbPayment;
            var deferred = q.defer();
            LocalInvoice.findById(localInvoiceId).populate('payment')
                .then(function (localinvoice) {
                    if (!localinvoice) {
                        return deferred.reject("Unable to locate invoice for refund.");
                    }
                    if (localinvoice.amount < amount) {
                        return deferred.reject("Attempting to refund more than the invoiced amount.");
                    }
                    if ((localinvoice.payment && localinvoice.paid) && !localinvoice.payment.manualOn) {

                        //Refund stripe, then issue a refund receipt
                        return Credit.refundTransaction(localinvoice.payment.transaction, amount)
                            .then(function () {
                                //TODO: Email that a refund was processed.

                                const accountName = process.env.NODE_ENV == 'development' ? 'Checking' : 'Chase Bank';

                                qbo.findAccounts({ "Name": accountName }, (err, objects) => {
                                    var accounts;

                                    if (err) {
                                        console.error(JSON.stringify(err));
                                        deferred.reject('Couldnot locate Checking Account to Debit on Refund');
                                        return;
                                    }
                                    if (objects) {
                                        accounts = objects.QueryResponse.Account;
                                    }
                                    if (accounts && accounts.length > 0) {
                                        accountId = accounts[0].Id;
                                        if (accountId) {
                                            let receiptObject = {
                                                "Line": [
                                                    {
                                                        "Amount": amount,
                                                        "DetailType": "SalesItemLineDetail",
                                                        "Description": reason || "AAPP Rejection.",
                                                        "SalesItemLineDetail": {
                                                            "ItemRef": {
                                                                "value": item
                                                            }
                                                        }
                                                    }
                                                ],
                                                "DepositToAccountRef": {
                                                    "value": accountId,
                                                    "name": "Chase Bank"
                                                }
                                            };
                                            if(customerRef){
                                                receiptObject["CustomerRef"] = customerRef;
                                            }
                                            qbo.createRefundReceipt(receiptObject, (err, receipt) => {
                                                if (err) {
                                                    return deferred.reject('Error creating refund receipt.');
                                                }
                                                return deferred.resolve("Complete");
                                            });
                                        }
                                    }

                                });
                            })
                            .catch(function (err) {
                                console.error(err);
                                return q.reject("Couldn't refund credit card.");
                            })

                    } else {
                        //Just update the invoice, plus localinvoice, and resend.
                        qbo.getInvoice(localinvoice.invoiceRef, (err, qbinvoice) => {
                            if (err) {
                                deferred.reject(err);
                                return;
                            }
                            if (!qbinvoice) {
                                deferred.reject('Could not locate invoice.');
                                return;
                            }
                            //DO THE UPDATES
                            if (parseFloat(qbinvoice.TotalAmt) < amount) {
                                amount = parseFloat(qbinvoice.TotalAmt);
                            }
                            var newTotal = parseFloat(qbinvoice.TotalAmt) - amount;
                            qbinvoice.TotalAmt = newTotal;
                            qbInvoiceRef = qbinvoice.Id;
                            var refundObject = {
                                "Amount": 0 - amount,
                                "DetailType": "SalesItemLineDetail",
                                "Description": reason,
                                "SalesItemLineDetail": {
                                    "ItemRef": {
                                        "value": process.env.QB_CONFERENCE_FEE_ITEM,
                                        "name": "Conference Fee"
                                    }
                                }
                            };
                            qbinvoice.Line.push(refundObject);

                            qbo.updateInvoice(qbinvoice, (err, qbinvoiceupdate) => {
                                if (err) {
                                    deferred.reject(err);
                                    return;
                                }
                                localinvoice.amount = newTotal > 0 ? newTotal : 0;
                                if (newTotal <= 0) {
                                    localinvoice.paid = true;
                                }
                                localinvoice.save()
                                    .then(function () {
                                        EmailInvoice(qbInvoiceRef);
                                        deferred.resolve('REFUND PROCESSED');
                                    })
                                    .catch(function (err) {
                                        deferred.reject(err);
                                    });

                            });
                            return;
                        });
                    }
                })
                .catch(function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        });
}

function Test() {
    qbo()
        .then(function (qbo) {

            qbo.getCustomer('4869', (err, qbcustomer) => {
                if (err) {
                    console.error(err);
                }
                console.log("Test Customer", qbcustomer);
            });
        });
}

function FindCustomerByQBId(id) {
    var deferred = q.defer();
    qbo()
        .then(function (qbo) {

            qbo.getCustomer(id, (err, qbcustomer) => {
                if (err) {
                    deferred.resolve(null);
                    return;
                }
                if (!qbcustomer) {
                    deferred.resolve(null);
                    return;
                }

                deferred.resolve(qbcustomer);
            });
        });
    return deferred.promise;
}

function AdjustInvoice(invoiceRef, type, amount, note) {
    var deferred = q.defer();
    
    qbo()
        .then(function (qbo) {
            try {
                qbo.getInvoice(invoiceRef, (err, qbinvoice) => {
                    if (err) {
                        console.log(err);
                        deferred.reject(err);
                        return;
                    }
                    if (!qbinvoice) {
                        console.log("Could not find invoice.");
                        deferred.reject('Could not locate invoice.');
                        return;
                    }

                    amount = parseFloat(amount);
                    var totalAmount = parseFloat(qbinvoice.TotalAmt);



                    if (type == 'reduction') {
                        if (amount > totalAmount) {
                            amount = totalAmount;
                        }
                        qbinvoice.TotalAmt = totalAmount - amount;
                        var refundObject = {
                            "Amount": 0 - amount,
                            "DetailType": "SalesItemLineDetail",
                            "Description": note,
                            "SalesItemLineDetail": {
                                "ItemRef": {
                                    "value": process.env.QB_CONFERENCE_FEE_ITEM,
                                    "name": "Conference Fee"
                                }
                            }
                        };
                        qbinvoice.Line.push(refundObject);
                        qbo.updateInvoice(qbinvoice, (err, qbinvoiceupdate) => {
                            if (err) {
                                deferred.reject(err);
                                return;
                            }else if(!qbinvoiceupdate){
                                deferred.reject('Could not update the old invoice.');
                                return;
                            }else{
                                EmailInvoice(invoiceRef);
                                deferred.resolve(qbinvoiceupdate.TotalAmt);
                            }

                        });
                        return;

                    } else if (type == 'addition') {
                        qbinvoice.TotalAmt = totalAmount + amount;
                        var additionObject = {
                            "Amount": amount,
                            "DetailType": "SalesItemLineDetail",
                            "Description": note,
                            "SalesItemLineDetail": {
                                "ItemRef": {
                                    "value": process.env.QB_CONFERENCE_FEE_ITEM,
                                    "name": "Conference Fee"
                                }
                            }
                        };
                        qbinvoice.Line.push(additionObject);
                        qbo.updateInvoice(qbinvoice, (err, qbinvoiceupdate) => {
                            if (err) {
                                deferred.reject(err);
                                return;
                            }else if(!qbinvoiceupdate){
                                deferred.reject('Could not update the old invoice.');
                                return;
                            }else{
                                EmailInvoice(invoiceRef);
                                deferred.resolve(qbinvoiceupdate.TotalAmt);
                            }

                        });
                        return;

                    } else {
                        deferred.reject('Unknown operation.');
                        return;
                    }



                });
            } catch (e) {
                deferred.reject(JSON.stringify(e));
                return;
            }
        });
    return deferred.promise;

}

function GetInvoicePDF(invoiceId){
    var deferred = q.defer();
    qbo()
        .then(function (qbo) {
            qbo.getInvoicePdf(invoiceId, (err, response) => {
                if (err) {
                    console.error("ERROR SENDING INVOICE: ", JSON.stringify(err));
                    deferred.reject("Could not retrieve invoice.");
                    return;
                } else {
                    console.log("QB INVOICE SENT");
                    deferred.resolve(response);
                    return;
                }
            });
        })
        .catch(function (err) {
            console.error("ERROR SENDING INVOICE: ", err);
            deferred.reject("Error retrieving invoice.");
            return;
        });
    return deferred.promise;
}
