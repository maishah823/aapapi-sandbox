/**
* Redis Service
*
* Author: Greg Harkins
*
**/
var redis = require('redis');
var RedisSMQ = require("rsmq");
var Lua = require('redis-lua-loader');
var q = require('q');

var sub, client, lua, rsmq;


var RedisSvc = {
	get sub() {
		if (!sub) {
			sub = redis.createClient(process.env.REDIS_URL);
			this.sub.psubscribe('CHANNEL:*');
		}
		return sub;
	},
	get client() {
		if (!client) {
			client = redis.createClient(process.env.REDIS_URL);
		}
		return client;
	},
	get lua() {
		if (!lua) {
			this.initializeLua();
		}
		return lua;
	},
	get rsmq() {
		if (!rsmq) {
			rsmq = new RedisSMQ({ client: redis.createClient(process.env.REDIS_URL) });
			rsmq.createQueue({ qname: "workerQueue" }, function () { });
		}
		return rsmq;
	}
};


RedisSvc.initializeLua = function () {
	lua = new Lua(this.client, {
		src: __dirname + '/redis-scripts'
	});
	lua.on('ready', function () {
		console.log("Redis scripts loaded.");
	});
	lua.on('error', function (err) {
		console.error(err);
	});
};


RedisSvc.getCurrentConference = function(){
	var deferred = q.defer();
	this.client.get('currentconf',(err,result)=>{
		if(!result || err){
			return deferred.reject(err);
		}
		deferred.resolve(result);
	});
	return deferred.promise;
}


RedisSvc.sendToWorker = function (type, payload) {
	this.rsmq.sendMessage({ qname: "workerQueue", message: JSON.stringify({ type: type, payload: payload }) }, function (err) {
		if (err) {
			console.error(err);
		}
	});
};

RedisSvc.writeToLog = function(logType,message){
	this.rsmq.sendMessage({ qname: "workerQueue", message: JSON.stringify({ type: "writeLog", payload: {logType:logType,message:message} }) }, function (err) {
		if (err) {
			console.error(err);
		}
	});
}

RedisSvc.publish = function(channel, field, message){
    this.client.publish('CHANNEL:'+channel+':FIELD:'+field,JSON.stringify(message));
}

RedisSvc.qbtoken = function(){
	var deferred = q.defer();
	this.client.get('qb_access_token',function(err,token){
            if(!err && token){
				deferred.resolve(token);
			}else{
				deferred.reject(err);
			}
	});
	return deferred.promise;
}

//Shorthand async jobs
RedisSvc.syncMongoToRedis = function(){
	this.sendToWorker('usersSyncMongoToRedis');
	this.sendToWorker('updateChatMetadata');
}

module.exports = RedisSvc;
