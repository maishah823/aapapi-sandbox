var ChangeLog = require('../../models/changeLog');
module.exports = function(payload,done){
    var log = new ChangeLog({logMessage:payload.message, logType:payload.logType});
    log.save()
    .then(function(){
        done();
    })
    .catch(function(err){
        console.error('ChangeLog JOB FAILED: ',err);
        done();
    });


}