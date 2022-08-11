'use strict';
var moment = require('moment');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = require('q').Promise;
var Redis = require('../services/redisSvc.js');
var Quickbooks = require('../services/quickbooks');
var LUA = Redis.lua;

var RSMQWorker = require("rsmq-worker");
var worker = new RSMQWorker("workerQueue", { timeout: 10000, rsmq: Redis.rsmq });

//Continuously clean up online users...
setInterval(() => {
    Redis.client.ZREMRANGEBYSCORE('online', 0, moment().unix(), function (err, numRemoved) {
        if (!err && numRemoved) {
            Redis.client.ZRANGE('online', 0, -1, function (err, items) {
                if (!err && items) {

                    Redis.publish('conf', 'online', items);
                }
            });
        }

    });
}, 10000);

//Jobs
const usersSyncMongoToRedis = require('./jobs/usersSyncMongoToRedis');
const updateChatMetadata = require('./jobs/updateChatMetadata');
const writeLog = require('./jobs/writeLog');
const email = require('./jobs/email');
const refreshQuickbooks = require('./jobs/refreshQuickbooks');
refreshQuickbooks(() => {
    //MAKE SURE THE CORRECT QUICKBOOKS ENTITIES ARE IN PLACE
    Quickbooks.makeEntities();
});
const syncInvoicesToPayment = require('./jobs/syncInvoicesToPayment');
const makeMember = require('./jobs/makeMember');
const makeAttendee = require('./jobs/makeAttendee');
const confStats = require('./jobs/conferenceStats');
const createCert = require('./jobs/createCert');
const notifyUserUpdate = require('./jobs/notifyUserUpdate');
const remindMemberUpdate = require('./jobs/remindMemberUpdate');
const generalStats = require('./jobs/generalStats');
const yearlyDues = require('./jobs/yearlyDues');
const duesReminder = require('./jobs/duesReminder');
const checkoutReminder = require('./jobs/checkoutReminder');
const checkApps = require('./jobs/checkPendingApps');
const adjustInvoiceOnMerge = require('./jobs/adjustInvoiceOnMerge');
const sendSMSMessages = require('./jobs/sendSMSMessages');

/*
* Listening for messages on workerQueue. Payload should be structured as:
* {type: STRING, content: STRING}
*/

worker.on("message", function (msg, next, msgid) {

    var message = JSON.parse(msg);


    switch (message.type) {
        case 'refreshQuickbooks':
            refreshQuickbooks(next);
            break;
        case 'usersSyncMongoToRedis':
            usersSyncMongoToRedis(next);
            break;
        case 'updateChatMetadata':
            updateChatMetadata(next);
            break;
        case 'syncInvoicesToPayment':
            console.log("Syncing Payments...");
            syncInvoicesToPayment(message.payload, next);
            break;
        case 'writeLog':
            writeLog(message.payload, next);
            break;
        case 'emailNewMember':
            email.newMember(message.payload, next);
            break;
        case 'emailNewAdmin':
            email.newAdmin(message.payload, next);
            break;
        case 'emailNewInstructor':
            email.newInstructor(message.payload, next);
            break;
        case 'emailNewSchoolAdmin':
            email.newSchoolAdmin(message.payload, next);
            break;
        case 'emailNewStudent':
            email.newStudent(message.payload, next);
            break;
        case 'sendCertificate':
            email.sendCertificate(message.payload, next);
            break;
        case 'emailPasswordResetLink':
            email.passwordReset(message.payload, next);
            break;
        case 'makeMember':
            makeMember(message.payload, next);
            break;
        case 'rejectMember':
            email.rejectMember(message.payload, next);
            break;
        case 'makeAttendee':
            makeAttendee(message.payload, next);
            break;
        case 'rejectAttendee':
            email.rejectAttendee(message.payload, next);
            break;
        case 'confstats':
            confStats(message.payload, next);
            break;
        case 'createCert':
            createCert(message.payload, next);
            break;
        case 'notifyUserUpdate':
            notifyUserUpdate(message.payload, next);
            break;
        case 'remindMemberUpdate':
            remindMemberUpdate(next);
            break;
        case 'generalStats':
            generalStats(message.payload,next);
            break;
        case 'applicationSubmitted':
            email.applicationSubmitted(message.payload, next);
            break;
        case 'yearlyDues':
            yearlyDues(next);
            break;
        case 'duesReminder':
            duesReminder(next);
            break;
        case 'checkoutReminder':
                checkoutReminder(next);
                break;
        case 'notifyAdminOfApplication':
            email.notifyAdminOfApplication(message.payload, next);
            break;
        case 'notifySecretaryOfApproval':
            email.notifySecretaryOfApproval(message.payload,next);
            break;
        case 'checkPendingApps':
            checkApps(next);
            break;
        case 'adjustInvoiceOnMerge':
            adjustInvoiceOnMerge(message.payload,next);
            break;
        case 'sendSMSMessages':
            sendSMSMessages(message.payload,next);
            break;
        default:
            console.log("WORKER", "Received unknown message type:", message.type);
            next();
    }

});

// optional error listeners
worker.on('error', function (err, msg) {
    var message = JSON.stringify(msg);
    console.error("RSMQ ERROR", err, message, msg.id);
});
worker.on('exceeded', function (msg) {
    console.error("RSMQ EXCEEDED", msg.id);
});
worker.on('timeout', function (msg) {
    console.error("RSMQ TIMEOUT", msg.id, msg.rc);
});

worker.start();