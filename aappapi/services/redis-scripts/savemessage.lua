local user1 = KEYS[1]
local user2 = KEYS[2]
local message = KEYS[3]
redis.call('lpush','chat:'.. user1 .. ':' .. user2, message);
redis.call('lpush','chat:'.. user2 .. ':' .. user1, message);
redis.call('HINCRBY','new:'..user1,user2,1)
redis.call('HINCRBY','new:'..user2,user1,1)
