var jwt = require('jsonwebtoken');
var User = require('../models/user.js');
var Redis = require('./redisSvc');
var logger = require('./logger.js').get();
var validators = require('../validators');
var moment = require('moment');
var Guid = require('guid');


module.exports.listen = function (server) {

    //Start listening for socket connections
    var io = require('socket.io').listen(server);


    io.on('connection', function (socket) {

        logger.info('SOCKET [%s] CONNECTED', socket.id);

        var canSendChatMessages = false;
        var myUserId;
        var myUserName;
        var onlineInterval;

        socket.on('disconnect', function () {
            if(onlineInterval){
                clearInterval(onlineInterval);
            }
            logger.info('SOCKET [%s] DISCONNECTED', socket.id);
        });

        socket.join('all');

        socket.on('join', join);
        socket.on('leave', leave);
        socket.on('chat', chatMessage);
        socket.on('get-conversation', getConversation);

        function chatMessage(msg) {
            if (!canSendChatMessages || !myUserId || (msg.sentTo == myUserId)) {
                return;
            }

            if (validators.isValidObjectId(msg.sentTo)) {
                Redis.publish(msg.sentTo, 'chat', msg);
                Redis.lua.savemessage(3, myUserId, msg.sentTo, JSON.stringify(msg), function (err, result) {
                    if (err) {
                        console.error(err);
                    }
                });

            } else {
                //THIS IS A GROUP... SEND TO ALL USERS
                Redis.lua.batchsavegroupmsgs(2, msg.sentTo, JSON.stringify(msg), function (err, result) {
                    if (err) {
                        console.error(err);
                    }
                });
                Redis.publish('conf', 'groupchat', msg);

            }
        }


        function join(data) {
            if (!data || !data.channel) {
                return;
            }
            if (data.channel === 'public') {
                socket.join('public');
                return;
            }
            //Auth required for others.
            jwt.verify(data.token, process.env.SOCKET_TOKEN_SECRET, function (err, decoded) {
                if (!err && decoded) {

                    socket.join(decoded._id);
                    myUserId = decoded._id;

                    User.findById(decoded._id)
                        .then(function (user) {
                            if(!user){
                                return;
                            }
                            switch (data.channel) {
                                case 'admin':
                                    if (user.isAdmin) socket.join('admin');
                                    break;
                                case 'conf':
                                    if (user.isAttendee || user.isInstructor) {
                                        canSendChatMessages = true;
                                        socket.join('conf');
                                        //Keep client logged in while connected.
                                        Redis.client.zadd('online', moment().add(9, 'seconds').unix(), myUserId);
                                        clearInterval(onlineInterval);
                                        onlineInterval = setInterval(() => {
                                            Redis.client.zadd('online', moment().add(9, 'seconds').unix(), myUserId);
                                        }, 8000);
                                        
                                        //SEND THE CURRENT CHAT META
                                        Redis.client.get('chatmeta', function (err, meta) {
                                            if(err){
                                                console.error(err);
                                                return;
                                            }
                                            if(!meta){
                                                return;
                                            }
                                            try {
                                                const parsed = JSON.parse(meta);
                                                if (parsed.groups) {
                                                    //Join all active groups.
                                                    Object.keys(parsed.groups).forEach((key) => {socket.join(key) });
                                                    //Send inital metadata.
                                                    Redis.publish(myUserId, 'meta', parsed);
                                                }
                                            } catch (err) {
                                                console.error("ERROR parsing CHAT META", err);
                                            }
                                        });
                                        //SEND THE LIST OF CURRENTLY ONLINE
                                        Redis.client.ZRANGE('online', 0, -1, function (err, items) {
                                            if (!err && items) {
                                                Redis.publish('conf', 'online', items);
                                            }
                                        });
                                    }
                                    break;
                                case 'member':
                                    if (user.isMember) socket.join('member');
                                    break;
                                case 'developer':
                                    if (user.isDeveloper) socket.join('developer');
                            }
                        })
                        .catch(function (err) {
                            console.error(err);
                        });
                } else if (err) {
                    socket.leave(data.channel);
                }
            });

        }

        function leave(channel) {
            if (channel == 'conf') {
                canSendChatMessages = false;
                Redis.client.get('chatmeta', function (err, meta) {
                    if(err){
                        console.error(err);
                        return;
                    }
                    if(!meta){
                        return;
                    }
                    try {
                        const parsed = JSON.parse(meta);
                        if (parsed.groups) {
                            //Join all active groups.
                            Object.keys(parsed.groups).forEach((key) => {socket.leave(key) });
                            //Send inital metadata.
                            Redis.publish(myUserId, 'meta', parsed);
                        }
                    } catch (err) {
                        console.error("ERROR parsing CHAT META", err);
                    }
                });
                clearInterval(onlineInterval);
            }
     
            socket.leave(channel);
        }

        function getConversation(chatId) {
            if (canSendChatMessages && myUserId) {
                Redis.client.lrange('chat:' + myUserId + ':' + chatId, 0, 100, function (err, chats) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    Redis.publish(myUserId, 'restore-chat', { user: chatId, chats: chats });
                });
            }
        }
    });




    Redis.sub.on('pmessage', function (pattern, channel, message) {
        var CHANNEL = channel.split(':')[1];
        var FIELD = channel.split(':')[3];
        io.to(CHANNEL).emit(FIELD, message);
    });







}