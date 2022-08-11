local mn = redis.call('GET','next-member-number');
redis.call('INCRBY','next-member-number',1);
return mn;