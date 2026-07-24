const Client = require('../models/Client');

const authenticateClient = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key missing' });
  }

  try {
    const client = await Client.findOne({ apiKey });
    if (!client) {
      return res.status(403).json({ error: 'Invalid API key' });
    }
    if (client.isBlocked) {
      return res.status(403).json({ error: 'Client is blocked' });
    }
    req.client = client;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth check failed' });
  }
};

module.exports = authenticateClient;