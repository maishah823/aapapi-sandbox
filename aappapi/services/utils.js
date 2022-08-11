const Redis = require('./redisSvc');
const q = require('q');
module.exports = {
    getCurrentConference:GetCurrentConference
}

function GetCurrentConference(){
    var deferred = q.defer();
    Redis.client.get('currentconf',(err,conf)=>{
        if(err){
            deferred.reject(err);
            return;
        }
        deferred.resolve(conf);
    });

    return deferred.promise;

}