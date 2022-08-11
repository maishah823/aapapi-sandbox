local room = KEYS[1]
local msg = KEYS[2]
local users = redis.call('ZRANGE','users',0,-1);
local i = 1;
while users[i] do
   redis.call('LPUSH','chat:' .. users[i] .. ':' .. room,msg)
   redis.call('HINCRBY','new:'..users[i],room,1)
    i=i+1
end