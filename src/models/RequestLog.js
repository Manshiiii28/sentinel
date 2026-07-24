const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  endpoint: { type: String, required: true },
  ip: String,
  status: { type: String, enum: ['allowed', 'denied', 'flagged'], required: true },
  anomalyScore: { type: Number, default: 0 },
  reason: String,
  timestamp: { type: Date, default: Date.now },
});

requestLogSchema.index({ clientId: 1, timestamp: -1 });

module.exports = mongoose.model('RequestLog', requestLogSchema);