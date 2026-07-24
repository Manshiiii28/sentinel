const { checkTokenBucket } = require('../services/tokenBucket');
const { checkSlidingWindow } = require('../services/slidingWindow');

const rateLimiterMiddleware = async (req, res, next) => {
  const client = req.client;
  const clientId = client._id.toString();

  try {
    let result;
    if (client.algorithm === 'sliding_window') {
      result = await checkSlidingWindow(clientId, client.rateLimit, client.windowSeconds);
    } else {
      result = await checkTokenBucket(clientId, client.rateLimit, client.windowSeconds);
    }

    res.set('X-RateLimit-Limit', client.rateLimit);
    res.set('X-RateLimit-Algorithm', client.algorithm);

    if (!result.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: client.windowSeconds,
      });
    }

    next();
  } catch (err) {
    console.error('Rate limiter error:', err);
    res.status(500).json({ error: 'Rate limiting failed' });
  }
};

module.exports = rateLimiterMiddleware;