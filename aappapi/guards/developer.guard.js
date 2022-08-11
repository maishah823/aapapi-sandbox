var ApiError = require('../classes/ApiError');
var Redis = require('../services/redisSvc');
module.exports = function(req,res,next){
    if(!req.decoded){
        return res.status(403).send(new ApiError('Permissions', 'Unauthorized'));
    }
    if(!req.decoded.isDeveloper){
        var msg = `${req.decoded.name || 'An unknown user'} tried to access developer resource.`;
        Redis.writeToLog('Security',msg);
        console.log("GUARD: ", msg);
        return res.status(403).send(new ApiError('Permissions', 'Unauthorized'));
    }else{
        next();
    }
};