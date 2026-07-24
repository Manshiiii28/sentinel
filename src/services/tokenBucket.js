const { redisClient } = require('../config/redis');

const TOKEN_BUCKET_SCRIPT = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
local tokens = tonumber(bucket[1])
local lastRefill = tonumber(bucket[2])

if tokens == nil then
  tokens = capacity
  lastRefill = now
end

local elapsed = math.max(0, now - lastRefill)
local refillAmount = elapsed * refillRate
tokens = math.min(capacity, tokens + refillAmount)

local allowed = 0
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
end

redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', now)
redis.call('EXPIRE', key, 3600)

return {allowed, tokens}
`;

async function checkTokenBucket(clientId, capacity, windowSeconds) {
  const refillRate = capacity / windowSeconds;
  const now = Date.now() / 1000;
  const key = `tb:${clientId}`;

  const result = await redisClient.eval(TOKEN_BUCKET_SCRIPT, {
    keys: [key],
    arguments: [String(capacity), String(refillRate), String(now)],
  });

  return { allowed: result[0] === 1, remaining: result[1] };
}

module.exports = { checkTokenBucket };