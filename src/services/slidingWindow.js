const { redisClient } = require('../config/redis');

async function checkSlidingWindow(clientId, limit, windowSeconds) {
  const key = `sw:${clientId}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  const multi = redisClient.multi();
  multi.zRemRangeByScore(key, 0, windowStart);
  multi.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
  multi.zCard(key);
  multi.expire(key, windowSeconds);

  const results = await multi.exec();
  const count = results[2];

  return { allowed: count <= limit, count, limit };
}

module.exports = { checkSlidingWindow };