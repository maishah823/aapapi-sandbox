var express = require('express');
var router = express.Router();
var Redis = require('../../services/redisSvc');
var ApiError = require('../../classes/ApiError');
var validators = require('../../validators');

router.get('/conv/:room',(req,res)=>{
    var cursor = parseInt(req.query.cursor) || 0;
    const limit = 20;
    const room = req.params.room;
    const user = req.decoded._id;

    Redis.client.LRANGE('chat:'+user+':'+room, cursor, cursor + limit, function(err,result){
        try{
            var parsed = result.map(JSON.parse);
            res.json(parsed);
        }catch(err){
            console.error(err);
            res.status(500).send(new ApiError('Conv. Error', 'Could not retrieve historical messages.'));
        }
    });
});

router.get('/stats',(req,res)=>{
    //SEND NEW MESSAGE COUNTS
    Redis.client.HGETALL('new:'+ req.decoded._id, function(err,stats){
        if(err){
            res.status(500).send(new ApiError('Error', 'Could not update new messages.'));
        }
       res.json(stats);
    });
});

router.post('/markRoomAsViewed',(req,res)=>{
    if(!req.body.room){
        return res.status(500).send(new ApiError('Chat', 'Cannot mark unknown room as viewed.'));
    }
    Redis.client.HDEL('new:'+req.decoded._id,req.body.room,(err,result)=>{
        if(err){
            return res.status(500).send(new ApiError('Chat', 'Error marking room as viewed.'));
            console.error("Error updating chat state tree.");
        }
        return res.json({room:req.body.room});
    });
    
});


module.exports = router;