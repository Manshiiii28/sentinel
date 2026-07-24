const express = require('express');
const router = express.Router();
const authenticateClient = require('../middleware/auth');
const rateLimiterMiddleware = require('../middleware/rateLimiter');
const RequestLog = require('../models/RequestLog');
const { canRequestProceed, recordSuccess, recordFailure } = require('../services/circuitBreaker');
const { checkIpReputation } = require('../services/ipReputation');
const { requestsAllowed, requestsDenied, requestsFlagged } = require('../services/metrics');
const { sendSlackAlert } = require('../services/slackAlert');
const { explainAnomaly } = require('../services/aiExplanation');
const { checkMLAnomaly } = require('../services/mlAnomaly');

const MOCK_SERVICE = 'mock-backend';

router.all('/*', authenticateClient, rateLimiterMiddleware, async (req, res) => {
  // Step 1: Circuit breaker check
  if (!canRequestProceed(MOCK_SERVICE)) {
    requestsDenied.inc();

    const explanation = await explainAnomaly(
      `Circuit breaker opened for backend service after repeated failures. Client: ${req.client.name}.`
    );
    sendSlackAlert(`🚨 Circuit breaker OPEN!\n${explanation}`);

    await RequestLog.create({
      clientId: req.client._id,
      endpoint: req.originalUrl,
      ip: req.ip,
      status: 'denied',
      reason: 'Circuit breaker OPEN - backend unhealthy',
    });

    return res.status(503).json({
      error: 'Service temporarily unavailable',
      reason: 'circuit_open',
    });
  }

  // Step 2: ML anomaly check (demo values — in production these come from real traffic stats)
  const mlCheck = await checkMLAnomaly(
    Math.random() * 10,
    Math.random() * 5,
    Math.random() * 5
  );

  // Step 3: IP reputation check (flag only, don't block)
  const ipCheck = await checkIpReputation(req.ip);

  const isSuspicious = ipCheck.isSuspicious || mlCheck.is_anomaly;

  try {
    const shouldFail = req.query.fail === 'true';

    if (shouldFail) {
      throw new Error('Mock backend failure');
    }

    recordSuccess(MOCK_SERVICE);

    if (isSuspicious) {
      requestsFlagged.inc();

      const explanation = await explainAnomaly(
        `Client ${req.client.name} made a request from IP ${req.ip}. IP flag: ${ipCheck.reason}. ML anomaly score: ${mlCheck.anomaly_score}.`
      );
      sendSlackAlert(`⚠️ Suspicious activity!\n${explanation}`);
    } else {
      requestsAllowed.inc();
    }

    await RequestLog.create({
      clientId: req.client._id,
      endpoint: req.originalUrl,
      ip: req.ip,
      status: isSuspicious ? 'flagged' : 'allowed',
      anomalyScore: mlCheck.anomaly_score || 0,
      reason: isSuspicious ? (ipCheck.isSuspicious ? ipCheck.reason : 'ML anomaly detected') : undefined,
    });

    res.json({
      message: 'Request passed through Sentinel',
      client: req.client.name,
      endpoint: req.originalUrl,
      ipReputation: {
        suspicious: ipCheck.isSuspicious,
        reason: ipCheck.reason,
        country: ipCheck.country || null,
      },
      mlAnomaly: {
        isAnomaly: mlCheck.is_anomaly,
        score: mlCheck.anomaly_score,
      },
    });
  } catch (err) {
    recordFailure(MOCK_SERVICE);
    requestsDenied.inc();

    await RequestLog.create({
      clientId: req.client._id,
      endpoint: req.originalUrl,
      ip: req.ip,
      status: 'denied',
      reason: err.message,
    });

    res.status(502).json({
      error: 'Backend request failed',
      message: err.message,
    });
  }
});

module.exports = router;