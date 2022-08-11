local collect = {}
local users = redis.call('HGETALL','users');
local groups = redis.call('HGETALL','groups');
local g = 1;
while groups[g] do
    table.insert(collect, '{_id:\"' .. groups[g] ..'\", name:\"'.. groups[g+1] .. '\"}')
    g=g+2
end
local u = 1;
while users[u] do
    table.insert(collect, '{_id:\"' .. users[u] ..'\", name:\"'.. users[u+1] .. '\"}')
    u=u+2
end
return collect