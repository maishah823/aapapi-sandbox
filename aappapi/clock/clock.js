var logger = require('../services/logger.js').get();
var Redis = require('../services/redisSvc.js');

var CronJob = require('cron').CronJob;
/*
* JOB: Update every minute.
*/
var stats = new CronJob('*/1 * * * *',
function(){
    Redis.sendToWorker('generalStats','all');
},
null,
true,
'America/New_York'
);


/*
* JOB: Refresh the Quickbooks token every 45 minutes.
*/
var quickbooksJob = new CronJob('*/50 * * * *',
function(){
    Redis.sendToWorker('refreshQuickbooks',null);
},
null,
true,
'America/New_York'
);

//compile stats every 5 minutes in case these become out of sync.
var confStats = new CronJob('*/5 * * * *',
function(){
    Redis.sendToWorker('confstats', 'all');
},
null,
true,
'America/New_York'
);



/*
* JOB: Daily
*/
var pendingApps = new CronJob('00 13 * * *',
function(){
    Redis.sendToWorker('checkPendingApps',{});
},
null,
true,
'America/New_York'
);

/*
* JOB: Every day, Sync users and groups in Mongo with Redis, in case they become out of sync.
*/
var syncMongoToRedis = new CronJob('30 1 * * *',
function(){
    Redis.syncMongoToRedis();
},
null,
true,
'America/New_York'
);

