var User = require('../models/user');
var syncToRedis = require('../worker/jobs/usersSyncMongoToRedis');
var updateChatMeta = require('../worker/jobs/updateChatMetadata');
var logger = require('../services/logger').get();
var Redis = require('../services/redisSvc');
var ChatGroup = require('../models/chatgroup');
var moment = require('moment-timezone');
var Topic = require('../models/topic');
var Conference = require('../models/conference');
var Coupon = require('../models/coupon');
var EmailSvc = require('../services/emailSvc');
var Quickbooks = require('../services/quickbooks');
var q = require('q');
var Student = require('../models/studentdiscount');
var Attendee = require('../models/attendeeInfo');


Conference.findOne().sort({ startDateTime: -1 })
	.then(function (conf) {

		process.env['currentconf'] = conf._id;
		Redis.client.set('currentconf', conf._id.toString(), () => { console.log("Setting current conference to ", conf._id); });
	})
	.catch(function (err) {
		console.error('Could not set current conference.', err);
	});

User.findOne({
	firstName: 'Greg',
	lastName: 'Harkins'
}, function (err, user) {
	if (!user) {
		var aUser = new User({
			firstName: 'Greg',
			lastName: 'Harkins',
			email: 'gregharkins@harcomtech.com',
			password: 'jersey',
			groups: ['regional-manager', 'makeAdmins', 'final-approval'],
			isAdmin: true,
			isMember: true,
			isDeveloper: true
		});

		aUser.save(function (err) {
			if (err) {

				logger.error("SYSTEM", "Error Saving Default User");
				logger.error(err);
			} else {
				logger.info("SYSTEM", "Default User Created");
			}
		});
	}
}
);

User.findOne({
	firstName: 'Adam',
	lastName: 'Rembisz'
}, function (err, user) {
	if (!user) {
		var aUser = new User({
			firstName: 'Adam',
			lastName: 'Rembisz',
			email: 'adam.rembisz@newbritainct.gov',
			password: 'jersey',
			groups: ['regional-manager', 'makeAdmins', 'final-approval'],
			isAdmin: true,
			isMember: true
		});

		aUser.save(function (err) {
			if (err) {

				logger.error("SYSTEM", "Error Saving Default User");
				logger.error(err);
			} else {
				logger.info("SYSTEM", "Default User Created");
			}
		});
	}
}
);

User.findOne({
	firstName: 'Amanda',
	lastName: 'Reece'
}, function (err, user) {
	if (!user) {
		var aUser = new User({
			firstName: 'Amanda',
			lastName: 'Reece',
			email: 'nom@policepolygraph.org',
			password: 'jersey',
			groups: ['makeAdmins', 'financial'],
			isAdmin: true,
		});

		aUser.save(function (err) {
			if (err) {

				logger.error("SYSTEM", "Error Saving Default User");
				logger.error(err);
			} else {
				logger.info("SYSTEM", "Default User Created");
			}
		});
	}
}
);



//DEFAULT INSTRUCTOR TOPIC
new Topic({ name: 'General' }).save();

//CHAT SETUP

new ChatGroup({ name: 'Conference Happenings' }).save();
new ChatGroup({ name: 'General Discussion' }).save();
new ChatGroup({ name: 'Polygraph Related' }).save();
new ChatGroup({ name: 'Social Hour' }).save();

//Sync
syncToRedis(() => { console.log('Users synced to Redis') });
updateChatMeta(() => { console.log('Chat Meta updated') });

new Conference({
	city: 'Phoenix',
	state: 'AZ',
	timezone: 'America/Phoenix',
	utcOffset: '-0700',
	startDateTime: moment.tz('2022-06-05T13:00', 'America/Phoenix').toDate(),
	endDateTime: moment.tz('2022-06-10T17:00', 'America/Phoenix').toDate(),
	memberPrice: 445,
	memberEarlyPrice: 320,
	nonMemberPrice: 545,
	nonMemberEarlyPrice: 445,
	vendorPrice: 500,
	vendorPriceEarly: 500,
	guestPrice: 125
}).save();

// Conference.findOne().sort({startDateTime:-1}).then((con) => { 
// 	new ClassroomEvent({
// 		name:'Sample Event',
// 		topic:'5aedbd35fae9e38343bec1d0',
// 		conference: con._id,
// 		startDateTime: new Date('2019-06-03T15:00Z'),
// 		endDateTime: new Date('2019-06-03T16:00Z'),
// 		timezone:con.timezone,
// 		room:'227b',
// 		instructors:['5aedce9e8b91d085e6bc3f1a'],
// 		files:[],
// 		description:'A sample event that takes place from 8 - 9 in the morning',
// 		created_by: '5acfb77540872d3ba97f8536'
// 	}).save().catch((err)=>{console.error(err)});
//  });




Redis.sendToWorker('confstats', 'all');
Redis.sendToWorker('generalStats', 'all');

var exec = require('child_process').exec;
exec('pdftk --version', function callback(error, stdout, stderr) {
	if (error) {
		console.error(error);
	}
	console.log(stdout);
});


//Develop yearly dues
// if(process.env.NODE_ENV == 'development'){
// Redis.sendToWorker('yearlyDues',{});
// }

//Develop dues reminder
// if(process.env.NODE_ENV == 'development'){
// Redis.sendToWorker('duesReminder',{});
// }



// Fix missing records in Quickbooks

// FixQuickbooks();
// async function FixQuickbooks() {
// 	try {
// 		let users = await User.find();
// 		await asyncForEach(users, async user => {
// 			await wait(500);
// 			console.log("-----------");
// 			if (user.customerId) {
// 				let customer = await Quickbooks.findCustomerByQBId(user.customerId);
// 				if (!customer) {
// 					let newId = await Quickbooks.createCustomer('', user.firstName, user.middleName, user.lastName, user.address, user.email);
// 					user.customerId = newId;
// 				}
// 			} else {
// 				let newId = await Quickbooks.createCustomer('', user.firstName, user.middleName, user.lastName, user.address, user.email);
// 				user.customerId = newId;
// 			}
// 			let saved = await user.save();
// 			console.log('Updated:', saved.fullname, saved.customerId);
// 		});
// 	} catch (e) {
// 		console.error(e);
// 	}
// }

// function wait(time) {
// 	var deferred = q.defer();
// 	setTimeout(() => { deferred.resolve() }, time);
// 	return deferred.promise;
// }

// async function asyncForEach(array, callback) {
// 	for (let index = 0; index < array.length; index++) {

// 		await callback(array[index], index, array)
// 	}
// }

//Remove CHECKEDOUT from all users
// User.find().then(users=>{
// 	let count = 0;
// 	for(let i=0;i<users.length;i++){
		
// 		if(users[i].checkedOut){
// 			count++;
// 		}
		
// 	}
// 	console.log(`${count} of ${users.length}`)
	
// })


// User.find().then(users=>{
// 	for(let i=0;i<users.length;i++){
// 		let user = users[i];
// 		if(user.memberLevel)
// 		if(user.memberLevel==='intern'){
// 			user.memberLevel='active';
// 		}
// 		if(user.checkedOut){
// 			user.checkedOut = false;
// 			user.checkedOutOn = null;
// 			user.save().then(u=>{
// 				console.log(`Removed CHECKEDOUT for ${u.fullname}`);
// 			}).catch(err=>{
// 				console.error('Remove CHECKEDOUT ERR:',err);
// 			})
// 		}
		
// 	}	
// })





