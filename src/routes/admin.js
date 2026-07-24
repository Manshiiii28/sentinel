const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Client = require('../models/Client');
const RequestLog = require('../models/RequestLog');

router.post('/clients', async (req, res) => {
  try {
    const { name, algorithm, rateLimit, windowSeconds } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const apiKey = uuidv4();

    const client = await Client.create({
      name,
      apiKey,
      algorithm: algorithm || 'token_bucket',
      rateLimit: rateLimit || 100,
      windowSeconds: windowSeconds || 60,
    });

    res.status(201).json({ client, apiKey });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/clients', async (req, res) => {
  try {
    const clients = await Client.find().select('-__v');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle block/unblock a client
router.patch('/clients/:id/block', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    client.isBlocked = !client.isBlocked;
    await client.save();

    res.json({ client });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recent request logs (for live feed)
router.get('/logs', async (req, res) => {
  try {
    const logs = await RequestLog.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('clientId', 'name');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;